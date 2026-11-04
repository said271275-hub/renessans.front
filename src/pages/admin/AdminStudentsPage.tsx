import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import { api } from '../../api/client';
import { Student, Group } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { DatePicker } from '../../components/ui/DatePicker';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    parentPhone: '',
    birthDate: '',
    groupId: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<Student[]>('/admin/students', {
        search: searchQuery,
        groupId: selectedGroupFilter,
      });
      setStudents(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await api.get<Group[]>('/admin/groups');
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchStudents();
    setCurrentPage(1);
  }, [searchQuery, selectedGroupFilter]);

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      phone: '',
      parentPhone: '',
      birthDate: '',
      groupId: groups[0]?.id ? String(groups[0].id) : '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      phone: student.phone,
      parentPhone: student.parentPhone,
      birthDate: student.birthDate,
      groupId: student.groupId ? String(student.groupId) : '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.parentPhone.trim() || !formData.birthDate) {
      setFormError('Iltimos, barcha majburiy maydonlarni to\'ldiring.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        parentPhone: formData.parentPhone.trim(),
        birthDate: formData.birthDate,
        groupId: formData.groupId ? Number(formData.groupId) : null,
      };

      if (editingStudent) {
        await api.put(`/admin/students/${editingStudent.id}`, payload);
      } else {
        await api.post('/admin/students', payload);
      }

      setIsModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      setFormError(err.message || 'Xatolik yuz berdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setIsSubmitting(true);
      await api.delete(`/admin/students/${studentToDelete.id}`);
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'O\'chirishda xatolik yuz berdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination slicing
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return students.slice(startIndex, startIndex + pageSize);
  }, [students, currentPage]);

  const totalPages = Math.ceil(students.length / pageSize) || 1;

  const columns: Column<Student>[] = [
    {
      header: 'F.I.SH.',
      accessor: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl neu-raised flex items-center justify-center font-bold text-xs text-[var(--accent)]">
            {s.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-sm text-[var(--text-primary)]">{s.fullName}</p>
            <p className="text-xs text-[var(--text-muted)]">Tug'ilgan: {s.birthDate}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Guruh',
      accessor: (s) => (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">
          {s.group?.name || 'Guruhsiz'}
        </span>
      ),
    },
    {
      header: 'Telefon',
      accessor: (s) => <span className="text-xs font-mono">{s.phone}</span>,
    },
    {
      header: 'Ota-ona telefoni',
      accessor: (s) => <span className="text-xs font-mono">{s.parentPhone}</span>,
    },
    {
      header: 'Amallar',
      className: 'text-right',
      accessor: (s) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => openEditModal(s)}
            className="!p-2 text-[var(--accent)]"
            title="Tahrirlash"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setStudentToDelete(s);
              setIsDeleteModalOpen(true);
            }}
            className="!p-2"
            title="O'chirish"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">O'quvchilar ro'yxati</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Jami {students.length} nafar o'quvchi ro'yxatga olingan
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateModal}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-[var(--shadow-raised)]"
        >
          Yangi o'quvchi qo'shish
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card variant="raised-sm" className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <Select
            value={selectedGroupFilter}
            onValueChange={setSelectedGroupFilter}
          >
            <option value="">Barcha guruhlar</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Table
        data={paginatedStudents}
        columns={columns}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        emptyMessage="O'quvchilar topilmadi"
      />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? "O'quvchi ma'lumotlarini tahrirlash" : "Yangi o'quvchi qo'shish"}
        description="O'quvchi va uning ota-onasi haqidagi ma'lumotlarni kiriting"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl neu-inset bg-rose-500/10 text-rose-600 text-xs font-semibold">
              {formError}
            </div>
          )}

          <Input
            label="Ism va Familiya"
            placeholder="Masalan: Sardor Rustamov"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telefon raqami"
              placeholder="+998 90 123 45 67"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Ota-ona telefoni"
              placeholder="+998 93 765 43 21"
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DatePicker
              label="Tug'ilgan sana"
              value={formData.birthDate}
              onChange={(birthDate) => setFormData({ ...formData, birthDate })}
              required
            />
            <Select
              label="Guruh"
              value={formData.groupId}
              onValueChange={(groupId) => setFormData({ ...formData, groupId })}
            >
              <option value="">Guruhsiz</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button
              type="button"
              variant="default"
              onClick={() => setIsModalOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {editingStudent ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="O'quvchini o'chirish"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Haqiqatan ham <strong className="text-[var(--text-primary)]">{studentToDelete?.fullName}</strong> ismli o'quvchini o'chirmoqchimisiz? Ushbu amal qaytarilmaydi.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="default"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isSubmitting}
              onClick={confirmDelete}
            >
              Ha, o'chirish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
