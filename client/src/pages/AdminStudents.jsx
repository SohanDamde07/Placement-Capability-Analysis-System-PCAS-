import { useState, useEffect } from 'react';
import api from '../api/axios';

const BRANCHES = ['All', 'CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AI/ML', 'Data Science'];
const STATUSES = ['All', 'Placement Ready', 'Intermediate', 'Beginner', 'Not Analyzed'];

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [selectedBranch, selectedYear, selectedStatus]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedBranch !== 'All') params.branch = selectedBranch;
      if (selectedYear !== 'All') params.year = selectedYear;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/api/admin/students', { params });
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the student profile for "${name}"? This action cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/admin/user/${id}`);
      setStudents(prev => prev.filter(s => s._id !== id));
      if (selectedStudent?._id === id) setSelectedStudent(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setActionLoading(false);
    }
  };

  const exportToCSV = () => {
    if (students.length === 0) {
      setExportMsg('⚠️ No students loaded to export. Apply filters first.');
      setTimeout(() => setExportMsg(''), 3000);
      return;
    }

    setExporting(true);
    setExportMsg('');

    try {
      const token = localStorage.getItem('pcas_token');
      const params = new URLSearchParams({ token });
      if (selectedBranch !== 'All') params.set('branch', selectedBranch);
      if (selectedYear   !== 'All') params.set('year',   selectedYear);
      if (selectedStatus !== 'All') params.set('status', selectedStatus);
      if (search.trim())            params.set('search', search.trim());

      // Open as a real browser download — server sends Content-Disposition: attachment
      window.open(`http://localhost:5000/api/admin/export-csv?${params.toString()}`, '_self');
      setExportMsg(`✅ Download started for ${students.length} student records.`);
    } catch (err) {
      setExportMsg('❌ Export failed. Please try again.');
      console.error('CSV export error:', err);
    } finally {
      setExporting(false);
      setTimeout(() => setExportMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-headline text-on-surface">Student Placement Directory</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Filter, inspect capability dossiers, and export recruitment shortlists</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={exportToCSV}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs shadow-sm transition-all"
          >
            {exporting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-sm">download</span>
            )}
            {exporting ? 'Exporting...' : 'Export CSV for Recruiters'}
          </button>
          {exportMsg && (
            <span className="text-[11px] font-medium text-on-surface-variant">{exportMsg}</span>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 md:p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              placeholder="Search by student name or college email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-surface rounded-2xl text-xs text-on-surface border border-outline-variant/50 focus:border-primary outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary text-white rounded-2xl text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-outline-variant/20">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Department</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 bg-surface rounded-xl text-xs text-on-surface border border-outline-variant/50 outline-none"
            >
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-surface rounded-xl text-xs text-on-surface border border-outline-variant/50 outline-none"
            >
              <option value="All">All Years</option>
              {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Readiness Tier</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-surface rounded-xl text-xs text-on-surface border border-outline-variant/50 outline-none"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-outline-variant/40 bg-surface-container/40 text-on-surface-variant font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-4">Branch & Year</th>
                <th className="py-4 px-4">PRS Score</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Skills Declared</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-on-surface-variant">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading student directory...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-on-surface-variant">
                    No matching student profiles found.
                  </td>
                </tr>
              ) : (
                students.map(s => {
                  const badgeColor =
                    s.classification === 'Placement Ready'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : s.classification === 'Intermediate'
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      : s.classification === 'Beginner'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200';

                  return (
                    <tr key={s._id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-on-surface text-sm">{s.name}</div>
                        <div className="text-[11px] text-on-surface-variant">{s.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-on-surface">{s.branch}</span>
                        <span className="text-on-surface-variant block text-[11px]">Year {s.year}</span>
                      </td>
                      <td className="py-4 px-4">
                        {s.prsScore !== null ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black font-headline text-primary">{s.prsScore}</span>
                            <span className="text-[10px] text-on-surface-variant">/ 100</span>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant italic">Pending</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                          {s.classification}
                        </span>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {s.skills.slice(0, 3).map((sk, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface text-[10px] font-medium">
                              {sk}
                            </span>
                          ))}
                          {s.skills.length > 3 && (
                            <span className="text-[10px] text-on-surface-variant font-bold self-center">
                              +{s.skills.length - 3}
                            </span>
                          )}
                          {s.skills.length === 0 && (
                            <span className="text-on-surface-variant text-[11px] italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] transition-colors"
                        >
                          View Dossier
                        </button>
                        <button
                          onClick={() => handleDeleteUser(s._id, s.name)}
                          disabled={actionLoading}
                          className="px-2.5 py-1.5 rounded-xl hover:bg-error-container text-outline hover:text-on-error-container transition-colors"
                          title="Delete Account"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Dossier Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-outline-variant/40 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Student Capability Dossier</span>
                <h2 className="text-2xl font-black font-headline text-on-surface mt-0.5">{selectedStudent.name}</h2>
                <p className="text-xs text-on-surface-variant">{selectedStudent.email} &bull; {selectedStudent.branch} (Year {selectedStudent.year})</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Score & Tier Banner */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant">Placement Readiness Score</span>
                <p className="text-3xl font-black font-headline text-primary">
                  {selectedStudent.prsScore != null ? selectedStudent.prsScore : 'N/A'} <span className="text-sm font-semibold text-on-surface-variant">/ 100</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-on-surface-variant block mb-1">Assessed Tier</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white">
                  {selectedStudent.classification}
                </span>
              </div>
            </div>

            {/* Radar Feature Breakdown */}
            {selectedStudent.featureScores && Object.keys(selectedStudent.featureScores).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Factor Scores Breakdown (0–100)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(selectedStudent.featureScores).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-surface-container text-center">
                      <span className="text-[10px] text-on-surface-variant capitalize block">{key}</span>
                      <span className="text-lg font-black text-on-surface font-headline">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills List */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Verified Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.skills.length > 0 ? (
                  selectedStudent.skills.map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-semibold text-on-surface">
                      {sk}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-on-surface-variant italic">No skills entered by student.</span>
                )}
              </div>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-outline-variant/30 text-center">
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-[10px] text-on-surface-variant block">CGPA</span>
                <span className="font-bold text-sm text-on-surface">{selectedStudent.cgpa || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-[10px] text-on-surface-variant block">Projects</span>
                <span className="font-bold text-sm text-on-surface">{selectedStudent.projectCount || 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-[10px] text-on-surface-variant block">Internships</span>
                <span className="font-bold text-sm text-on-surface">{selectedStudent.internshipCount || 0}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
