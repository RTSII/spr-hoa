import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ProfileCard from '@/components/ProfileCard';
import '@/components/ProfileCard.css';


type DirectoryEntry = {
  id: string;
  unit_number: string;
  first_name: string;
  last_name: string;
  email: string;
};

const Directory = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [supermemoryQuery, setSupermemoryQuery] = useState('');
  const [supermemoryResults, setSupermemoryResults] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [expandedResident, setExpandedResident] = useState<any | null>(null);

  // Helper to get preferred contact method
  const getPreferredContact = (resident: any) => {
    if (resident.show_email && resident.email) return resident.email;
    if (resident.show_phone && resident.phone) return resident.phone;
    return '';
  };

  useEffect(() => {
    if (profile && !profile.directory_opt_in) {
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }
    fetchResidents();
  }, [profile]);

  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .select('*')
        .eq('directory_opt_in', true)
        .order('unit_number');
      if (error) throw error;
      setResidents(data || []);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResidents = residents.filter((resident) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${resident.first_name} ${resident.last_name}`.toLowerCase();
    const unit = resident.unit_number.toLowerCase();
    const building = resident.unit_number.charAt(0).toUpperCase();
    const buildingMatch = buildingFilter ? building === buildingFilter : true;
    return buildingMatch && (fullName.includes(searchLower) || unit.includes(searchLower));
  });

  // Helper: get resident photo or shadow image
  const getResidentPhoto = (resident: any) => {
    if (
      resident.show_profile_photo &&
      resident.profile_picture_url &&
      resident.profile_picture_status === 'approved'
    ) {
      return resident.profile_picture_url;
    }
    return require('@/assets/images/shadow_profile.png'); // fallback shadow image
  };

  const exportDirectoryPDF = async () => {
    const element = document.getElementById('directory-list-pdf');
    if (!element) return;
    const canvas = await html2canvas(element, { backgroundColor: null, scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - 40;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.setFillColor('#2953A6');
    pdf.rect(0, 0, pageWidth, 60, 'F');
    pdf.setTextColor('#fff');
    pdf.setFontSize(22);
    pdf.text('Sandpiper Run Resident Directory', 40, 40);
    pdf.addImage(imgData, 'PNG', 20, 70, pdfWidth, pdfHeight);
    pdf.save(`sandpiper-run-directory-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-display font-bold text-white mb-4 md:mb-0">
            Resident Directory
          </h1>
          <a
            href="/profile"
            className="glass-button ml-0 md:ml-4 mt-4 md:mt-0 text-base font-semibold px-6 py-2 rounded-lg shadow-lg bg-gradient-to-r from-[#2953A6] to-[#6bb7e3] text-white hover:from-[#1e3a6b] hover:to-[#4a90e2] focus:outline-none focus:ring-2 focus:ring-seafoam transition-all duration-200"
            aria-label="Manage My Directory Profile"
          >
            Manage My Directory Profile
          </a>
          <button
            onClick={exportDirectoryPDF}
            className="glass-button text-sm"
            disabled={filteredResidents.length === 0}
          >
            🖨️ Export Directory (PDF)
          </button>
        </div>

        {/* Opt-in Notice */}
        {profile && !profile.directory_opt_in && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-seafoam/20 border border-seafoam/50 rounded-lg p-4 mb-6"
          >
            <p className="text-white">
              You are not currently listed in the directory.
              <a href="/profile" className="ml-2 text-seafoam hover:text-seafoam/80 font-medium">
                Update your preferences
              </a>
            </p>
          </motion.div>
        )}

        {/* Building Filter & Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="w-full md:w-48 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-seafoam focus:border-transparent transition-all duration-200"
            aria-label="Filter by building"
          >
            <option value="">All Buildings</option>
            <option value="A">Building A</option>
            <option value="B">Building B</option>
            <option value="C">Building C</option>
            <option value="D">Building D</option>
          </select>
          <input
            type="text"
            placeholder="Search by name or unit number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-seafoam focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Supermemory AI Search Bar */}
        <div className="mb-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!supermemoryQuery) return;
              const { supermemorySearch } = await import('../lib/supermemoryClient');
              try {
                const result = await supermemorySearch(supermemoryQuery, 'resident-directory');
                setSupermemoryResults(result?.results || []);
              } catch (err) {
                setSupermemoryResults([]);
              }
            }}
            className="flex gap-2"
            role="search"
            aria-label="AI-powered resident search"
          >
            <input
              type="text"
              placeholder="AI-powered search (e.g. 'owners with pets', 'find all B units')"
              value={supermemoryQuery}
              onChange={(e) => setSupermemoryQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-seafoam focus:border-transparent transition-all duration-200"
            />
            <button
              type="submit"
              className="glass-button text-sm"
              disabled={!supermemoryQuery}
            >
              🔍 AI Search
            </button>
          </form>
          {supermemoryResults.length > 0 && (
            <div className="mt-2 text-white/80">
              <div className="font-bold mb-1">AI Search Results:</div>
              <ul className="list-disc ml-6">
                {supermemoryResults.map((res, i) => (
                  <li key={i}>{typeof res === 'string' ? res : JSON.stringify(res)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Directory Stats */}
        <div className="mb-6 text-white/70 text-sm">
          Showing {filteredResidents.length} of {residents.length} residents
        </div>

        {/* Directory List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-white/70">Loading directory...</p>
          </div>
        ) : filteredResidents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/70">
              {searchTerm ? 'No residents found matching your search.' : 'No residents have opted into the directory yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResidents.map((resident, index) => (
              <motion.div
                key={resident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="luxury-card p-8 rounded-2xl shadow-lg bg-gradient-to-br from-[#2953A6] via-white/10 to-[#6bb7e3] border-2 border-[#2953A6] hover:scale-[1.02] transition-transform duration-300"
                style={{ boxShadow: '0 4px 32px 0 rgba(41,83,166,0.12)' }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Resident Thumbnail (ProfileCard) */}
                  <div className="flex-shrink-0 cursor-pointer" onClick={() => setExpandedResident(resident)}>
                    <ProfileCard
                      avatarUrl={getResidentPhoto(resident)}
                      name={`${resident.first_name} ${resident.last_name}`}
                      handle={resident.unit_number}
                      status={getPreferredContact(resident)}
                      showUserInfo={false}
                      className="w-20 h-20"
                      behindGradient={undefined}
                      innerGradient={undefined}
                      miniAvatarUrl={undefined}
                      onContactClick={undefined}
                    />
                  </div>
                  {/* Resident Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-white">
                        {resident.first_name} {resident.last_name}
                      </span>
                      {/* Only show unit if opted-in */}
                      {resident.show_unit && (
                        <span className="text-seafoam text-xs font-bold bg-white/10 px-2 py-1 rounded ml-2">
                          Unit {resident.unit_number}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-col gap-1">
                      {/* Only show email if opted-in */}
                      {resident.show_email && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/80 text-sm">
                            {resident.email}
                          </span>
                        </div>
                      )}
                      {/* Only show phone if opted-in and present */}
                      {resident.show_phone && resident.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/80 text-sm">
                            {resident.phone}
                          </span>
                          <a href={`tel:${resident.phone}`} className="underline hover:text-[#6bb7e3]">
                            {resident.phone}
                          </a>
                        </div>
                      )}
                      {!resident.show_email && !resident.show_phone && (
                        <span className="text-white/60 italic" title="Contact info private">
                          Contact info private
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Privacy/Photo Status Icons */}
                  <div className="flex flex-col items-end gap-2">
                    {resident.show_profile_photo && resident.profile_picture_status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-[#6bb7e3] text-xs" title="Photo approved and shown">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Photo Shared
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-white/50 text-xs" title="No photo shared or pending approval">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        No Photo
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-white/5 rounded-lg">
          <p className="text-white/60 text-sm text-center">
            This directory only shows residents who have opted in. Contact information is displayed based on individual privacy preferences.
          </p>
        </div>
      </motion.div>
      {/* Expanded Resident Modal */}
      {expandedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setExpandedResident(null)}>
          <div className="bg-[#101a2b] rounded-2xl shadow-2xl p-8 max-w-xs w-full relative" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-3 right-3 text-white/70 hover:text-white text-xl font-bold focus:outline-none"
              onClick={() => setExpandedResident(null)}
              aria-label="Close profile card"
            >
              &times;
            </button>
            <ProfileCard
              avatarUrl={getResidentPhoto(expandedResident)}
              name={`${expandedResident.first_name} ${expandedResident.last_name}`}
              handle={expandedResident.unit_number}
              status={getPreferredContact(expandedResident)}
              showUserInfo={true}
              className="w-44 h-44 mx-auto"
              behindGradient={undefined}
              innerGradient={undefined}
              miniAvatarUrl={undefined}
              onContactClick={undefined}
            />
            <div className="mt-6 text-center">
              <div className="text-lg font-semibold text-white">{expandedResident.first_name} {expandedResident.last_name}</div>
              {getPreferredContact(expandedResident) ? (
                <div className="mt-2 text-seafoam text-base font-medium">
                  {expandedResident.show_email && expandedResident.email ? (
                    <a href={`mailto:${expandedResident.email}`}>{expandedResident.email}</a>
                  ) : expandedResident.show_phone && expandedResident.phone ? (
                    <a href={`tel:${expandedResident.phone}`}>{expandedResident.phone}</a>
                  ) : null}
                </div>
              ) : (
                <div className="mt-2 text-white/60 italic text-base">No public contact info</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;