import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Power,
  CalendarCheck,
  Mail,
  Hash,
  Eye,
  EyeOff,
  UserPlus,
  Filter,
  ArrowUpDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Phone,
  Calendar,
  Award,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const PAGE_SIZE = 8;

export const TeacherStudentsPage: React.FC = () => {
  const { success, error } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'roll' | 'attendance' | 'progress' | 'joined'>('roll');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Add student modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addFullName, setAddFullName] = useState('');
  const [addRollNumber, setAddRollNumber] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addMobile, setAddMobile] = useState('');
  const [addPassword, setAddPassword] = useState('Smit@12345');
  const [isAdding, setIsAdding] = useState(false);

  // Edit student modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editRollNumber, setEditRollNumber] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // View detail modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      const res = await api.getStudents();
      if (res.data?.success) {
        setStudents(res.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load students', err);
      error(err.response?.data?.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Check URL query param ?action=add-student
  useEffect(() => {
    if (searchParams.get('action') === 'add-student') {
      setIsAddOpen(true);
      // clean param
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleToggleStatus = async (student: any) => {
    try {
      const res = await api.toggleStudentStatus(student.id);
      if (res.data?.success) {
        const newStatus = res.data.data.isActive;
        success(`Account for ${student.fullName} has been ${newStatus ? 'enabled' : 'disabled'}.`);
        setStudents(prev =>
          prev.map(s => (s.id === student.id ? { ...s, isActive: newStatus } : s))
        );
        if (detailData && detailData.student.id === student.id) {
          setDetailData((prev: any) => ({
            ...prev,
            student: { ...prev.student, isActive: newStatus },
          }));
        }
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Status toggle failed');
    }
  };

  const handleToggleVisibility = async (student: any) => {
    try {
      const res = await api.toggleStudentVisibility(student.id);
      if (res.data?.success) {
        const isVisible = res.data.data.showOnPublicDirectory;
        success(`${student.fullName} is now ${isVisible ? 'visible on' : 'hidden from'} the public directory.`);
        setStudents(prev =>
          prev.map(s => (s.id === student.id ? { ...s, showOnPublicDirectory: isVisible } : s))
        );
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Visibility toggle failed');
    }
  };

  const handleOpenEdit = (student: any) => {
    setSelectedStudent(student);
    setEditFullName(student.fullName);
    setEditRollNumber(student.rollNumber);
    setEditEmail(student.email);
    setEditMobile(student.mobileNumber || '');
    setIsEditOpen(true);
  };

  const handleOpenDetail = async (student: any) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const res = await api.getStudentById(student.id);
      if (res.data?.success) {
        setDetailData(res.data.data);
      } else {
        // Fallback to basic object if endpoint returns partial
        setDetailData({
          student,
          attendanceSummary: {
            totalClasses: student.totalClasses || 0,
            presentCount: student.presentCount || 0,
            attendancePercent: student.attendancePercent || 100,
            records: [],
          },
          learningProgress: {
            completedLessons: student.completedLessons || 0,
            courses: [],
          },
          recentActivities: [],
        });
      }
    } catch (err) {
      setDetailData({
        student,
        attendanceSummary: {
          totalClasses: student.totalClasses || 0,
          presentCount: student.presentCount || 0,
          attendancePercent: student.attendancePercent || 100,
          records: [],
        },
        learningProgress: {
          completedLessons: student.completedLessons || 0,
          courses: [],
        },
        recentActivities: [],
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSaving(true);
    try {
      await api.updateStudent(selectedStudent.id, {
        fullName: editFullName,
        rollNumber: editRollNumber,
        email: editEmail,
        mobileNumber: editMobile,
      });
      success(`Updated details for student ${editFullName}`);
      setIsEditOpen(false);
      fetchStudents();
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Failed to update student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFullName || !addRollNumber || !addEmail) {
      error('Full Name, Roll Number, and Email are required');
      return;
    }

    setIsAdding(true);
    try {
      const res = await api.createStudent({
        fullName: addFullName,
        rollNumber: addRollNumber,
        email: addEmail,
        mobileNumber: addMobile,
        password: addPassword,
      });
      if (res.data?.success) {
        success(`Student "${addFullName}" successfully enrolled!`);
        setIsAddOpen(false);
        setAddFullName('');
        setAddRollNumber('');
        setAddEmail('');
        setAddMobile('');
        setAddPassword('Smit@12345');
        fetchStudents();
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Failed to enroll student');
    } finally {
      setIsAdding(false);
    }
  };

  // Filter & Sort
  const processedStudents = useMemo(() => {
    return students
      .filter((s) => {
        // Status filter
        if (statusFilter === 'active' && !s.isActive) return false;
        if (statusFilter === 'inactive' && s.isActive) return false;

        // Search filter
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.fullName?.toLowerCase().includes(q) ||
          s.username?.toLowerCase().includes(q) ||
          s.rollNumber?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') {
          comp = (a.fullName || '').localeCompare(b.fullName || '');
        } else if (sortBy === 'roll') {
          comp = (a.rollNumber || '').localeCompare(b.rollNumber || '');
        } else if (sortBy === 'attendance') {
          comp = (a.attendancePercent || 0) - (b.attendancePercent || 0);
        } else if (sortBy === 'progress') {
          comp = (a.completedLessons || 0) - (b.completedLessons || 0);
        } else if (sortBy === 'joined') {
          comp = new Date(a.joinedDate || 0).getTime() - new Date(b.joinedDate || 0).getTime();
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [students, searchQuery, statusFilter, sortBy, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(processedStudents.length / PAGE_SIZE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return processedStudents.slice(start, start + PAGE_SIZE);
  }, [processedStudents, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy, sortDirection]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Student Roster Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              {students.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-navy-600 mt-1">
            Enrolled class students, attendance percentages, progress metrics, and directory controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 shadow-soft hover:shadow-glow"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </Button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-primary-600 focus:bg-white transition"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status filter pills */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === 'all'
                  ? 'bg-white text-navy-900 shadow-sm font-bold'
                  : 'hover:text-navy-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === 'active'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'hover:text-emerald-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === 'inactive'
                  ? 'bg-white text-rose-700 shadow-sm font-bold'
                  : 'hover:text-rose-700'
              }`}
            >
              Disabled
            </button>
          </div>

          {/* Sort By Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-navy-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              <option value="roll">Roll Number</option>
              <option value="name">Name</option>
              <option value="attendance">Attendance %</option>
              <option value="progress">Completed Lessons</option>
              <option value="joined">Joined Date</option>
            </select>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="ml-1 text-[11px] font-bold text-primary-700 uppercase hover:underline"
              title="Toggle sort direction"
            >
              {sortDirection}
            </button>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      {isLoading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-navy-800 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Roll Number</th>
                  <th className="py-4 px-6">Email & Phone</th>
                  <th className="py-4 px-6">Attendance</th>
                  <th className="py-4 px-6">Lessons Completed</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Directory</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-navy-700">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-sm text-navy-900">No students found</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {searchQuery ? `No matches for "${searchQuery}".` : 'No students registered in this category.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => handleOpenDetail(student)}
                        >
                          <Avatar
                            src={student.avatarUrl}
                            name={student.fullName}
                            size="md"
                            className="ring-1 ring-slate-200 group-hover:ring-primary-400 transition"
                          />
                          <div>
                            <p className="font-bold text-navy-900 text-sm group-hover:text-primary-600 transition">
                              {student.fullName}
                            </p>
                            <p className="text-[11px] text-slate-400">@{student.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Roll Number */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
                          {student.rollNumber}
                        </span>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-4 px-6">
                        <p className="text-navy-900 font-medium">{student.email}</p>
                        <p className="text-[11px] text-slate-400">{student.mobileNumber}</p>
                      </td>

                      {/* Attendance */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-extrabold text-xs px-2 py-0.5 rounded-md ${
                              student.attendancePercent >= 80
                                ? 'bg-emerald-50 text-emerald-700'
                                : student.attendancePercent >= 60
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {student.attendancePercent}%
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({student.presentCount || 0}/{student.totalClasses || 0})
                          </span>
                        </div>
                      </td>

                      {/* Lessons Completed */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-secondary-700 bg-secondary-50 px-2 py-0.5 rounded-md border border-secondary-100">
                          {student.completedLessons || 0} completed
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {student.isActive ? (
                          <Badge variant="emerald" size="sm">Active</Badge>
                        ) : (
                          <Badge variant="rose" size="sm">Disabled</Badge>
                        )}
                      </td>

                      {/* Directory Visibility */}
                      <td className="py-4 px-6">
                        {student.showOnPublicDirectory !== false ? (
                          <Badge variant="primary" size="sm" className="bg-blue-50 text-primary-700 border-blue-200">Public</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm" className="bg-slate-100 text-slate-500">Hidden</Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-blue-50 transition"
                            title="View student profile & activity"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleVisibility(student)}
                            className={`p-1.5 rounded-lg transition ${
                              student.showOnPublicDirectory !== false
                                ? 'text-primary-600 hover:bg-blue-50'
                                : 'text-slate-400 hover:text-navy-900 hover:bg-slate-100'
                            }`}
                            title={
                              student.showOnPublicDirectory !== false
                                ? 'Hide student from public directory'
                                : 'Show student on public directory'
                            }
                          >
                            {student.showOnPublicDirectory !== false ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
                            title="Edit details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(student)}
                            className={`p-1.5 rounded-lg transition ${
                              student.isActive
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                            }`}
                            title={student.isActive ? 'Disable Student Account' : 'Enable Student Account'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {processedStudents.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 font-medium">
              <div>
                Showing{' '}
                <span className="font-bold text-navy-900">
                  {Math.min((currentPage - 1) * PAGE_SIZE + 1, processedStudents.length)}
                </span>{' '}
                to{' '}
                <span className="font-bold text-navy-900">
                  {Math.min(currentPage * PAGE_SIZE, processedStudents.length)}
                </span>{' '}
                of <span className="font-bold text-navy-900">{processedStudents.length}</span> students
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="px-2.5 py-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Prev
                </Button>
                <div className="px-3 py-1 font-bold text-navy-900 text-xs">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  className="px-2.5 py-1 text-xs"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Enroll New Student"
        description="Add a new student directly into the SMIT Web Class database."
        maxWidth="md"
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Malik Abubakkar"
            value={addFullName}
            onChange={(e) => setAddFullName(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Roll Number *"
              placeholder="e.g. WMA-2026-0045"
              value={addRollNumber}
              onChange={(e) => setAddRollNumber(e.target.value)}
              required
            />
            <Input
              label="Mobile Number"
              placeholder="0300-1234567"
              value={addMobile}
              onChange={(e) => setAddMobile(e.target.value)}
            />
          </div>
          <Input
            label="Email Address *"
            type="email"
            placeholder="student@smit.edu.pk"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            required
          />
          <Input
            label="Initial Password"
            type="text"
            value={addPassword}
            onChange={(e) => setAddPassword(e.target.value)}
            helperText="Default password given to student for initial login."
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isAdding}>
              Enroll Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Student Information"
        description="Update official records for this student."
        maxWidth="sm"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <Input
            label="Full Name"
            value={editFullName}
            onChange={(e) => setEditFullName(e.target.value)}
            required
          />
          <Input
            label="Roll Number"
            value={editRollNumber}
            onChange={(e) => setEditRollNumber(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            required
          />
          <Input
            label="Mobile Number"
            value={editMobile}
            onChange={(e) => setEditMobile(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Student Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Student Profile & Progress"
        description="Detailed classroom performance, attendance fidelity, and curriculum progression."
        maxWidth="lg"
      >
        {isDetailLoading || !detailData ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : (
          <div className="space-y-6">
            {/* Student Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-4">
                <Avatar
                  src={detailData.student?.avatarUrl}
                  name={detailData.student?.fullName}
                  size="lg"
                  className="ring-2 ring-primary-300"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-navy-900">{detailData.student?.fullName}</h3>
                    <Badge variant={detailData.student?.isActive ? 'emerald' : 'rose'} size="sm">
                      {detailData.student?.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">@{detailData.student?.username} • Roll: <span className="font-mono font-bold text-primary-700">{detailData.student?.rollNumber}</span></p>
                  <p className="text-xs text-slate-500 mt-0.5">{detailData.student?.email} • {detailData.student?.mobileNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEdit(detailData.student);
                  }}
                  className="text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={detailData.student?.isActive ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleStatus(detailData.student)}
                  className={`text-xs ${detailData.student?.isActive ? 'hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200' : ''}`}
                >
                  <Power className="w-3.5 h-3.5 mr-1" />
                  {detailData.student?.isActive ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Attendance Rate</p>
                <p className="text-lg font-extrabold text-navy-900 mt-0.5">
                  {detailData.attendanceSummary?.attendancePercent || 0}%
                </p>
                <p className="text-[11px] text-slate-500">
                  {detailData.attendanceSummary?.presentCount || 0} Present / {detailData.attendanceSummary?.totalClasses || 0} Total
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Absent Sessions</p>
                <p className="text-lg font-extrabold text-rose-600 mt-0.5">
                  {detailData.attendanceSummary?.absentCount || 0}
                </p>
                <p className="text-[11px] text-slate-500">Missed classes</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Completed Lessons</p>
                <p className="text-lg font-extrabold text-secondary-600 mt-0.5">
                  {detailData.learningProgress?.completedLessons || 0}
                </p>
                <p className="text-[11px] text-slate-500">Total videos watched</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Enrolled Since</p>
                <p className="text-xs font-bold text-navy-900 mt-1">
                  {detailData.student?.joinedDate ? new Date(detailData.student.joinedDate).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-[11px] text-slate-500">Class Batch 2026</p>
              </div>
            </div>

            {/* Course Progress Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase text-navy-800 tracking-wider mb-2.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary-600" />
                Course Curriculum Progression
              </h4>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {detailData.learningProgress?.courses?.length === 0 ? (
                  <p className="text-xs text-slate-400">No courses available.</p>
                ) : (
                  detailData.learningProgress?.courses?.map((c: any) => (
                    <div key={c.courseId} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-navy-900">{c.title}</span>
                        <span className="font-bold text-primary-700">
                          {c.completedVideos} / {c.totalVideos} ({c.progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-primary-600 to-secondary-600 rounded-full transition-all duration-500"
                          style={{ width: `${c.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activities */}
            {detailData.recentActivities && detailData.recentActivities.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase text-navy-800 tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Recent Student Activity
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {detailData.recentActivities.map((act: any) => (
                    <div key={act.id} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="font-medium text-navy-800">{act.description}</span>
                      <span className="text-[10px] text-slate-400">{new Date(act.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
