import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, GraduationCap, Phone, BookOpen, Key, Check } from 'lucide-react';
import { api } from '../../api/client';
import { Teacher } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

const subjectOptions = [
  'Ingliz tili',
  'IELTS',
  'CEFR',
  'Rus tili',
  'Matematika',
  'Koreys tili',
  'Ona tili va adabiyot',
];

export const AdminTeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    subjects: [] as string[],
    login: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<Teacher[]>('/admin/teachers');
      setTeachers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFormData({
      fullName: '',
      phone: '',
      subjects: [],
      login: '',
      password: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      fullName: teacher.user.fullName,
      phone: teacher.phone,
      subjects: subjectOptions.filter(subject => teacher.subject.includes(subject)),
      login: teacher.user.login,
      password: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || formData.subjects.length === 0) {
      setFormError('Iltimos, ism, telefon va kamida bitta fanni tanlang.');
      return;
    }

    if (!editingTeacher && (!formData.login.trim() || !formData.password.trim())) {
      setFormError('Yangi o\'qituvchi uchun login va parol kiritilishi shart.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      if (editingTeacher) {
        await api.put(`/admin/teachers/${editingTeacher.id}`, {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          subject: formData.subjects.join(', '),
          password: formData.password ? formData.password.trim() : undefined,
        });
      } else {
        await api.post('/admin/teachers', {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          subject: formData.subjects.join(', '),
          login: formData.login.trim(),
          password: formData.password.trim(),
        });
      }

      setIsModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      setFormError(err.message || 'Xatolik yuz berdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    try {
      setIsSubmitting(true);
      await api.delete(`/admin/teachers/${teacherToDelete.id}`);
      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
      fetchTeachers();
    } catch (err: any) {
      alert(err.message || 'O\'qituvchini o\'chirishda xatolik yuz berdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Teacher>[] = [
    {
      header: 'O\'qituvchi',
      accessor: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl neu-raised flex items-center justify-center font-bold text-sm text-[var(--accent)]">
            {t.user.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-sm text-[var(--text-primary)]">{t.user.fullName}</p>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Key className="w-3 h-3" /> Login: {t.user.login}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Fani',
      accessor: (t) => (
        <div className="flex flex-wrap gap-1.5">
          {t.subject.split(',').map(subject => subject.trim()).filter(Boolean).map(subject => (
            <span
              key={subject}
              className="inline-flex items-center gap-1.5 rounded-xl bg-black/5 px-2.5 py-1 text-xs font-semibold dark:bg-white/5"
            >
              <BookOpen className="h-3.5 w-3.5 opacity-70" />
              {subject}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Telefon',
      accessor: (t) => (
        <span className="text-xs font-mono flex items-center gap-1 text-[var(--text-secondary)]">
          <Phone className="w-3 h-3 opacity-60" /> {t.phone}
        </span>
      ),
    },
    {
      header: 'Biriktirilgan guruhlar',
      accessor: (t) => (
        <span className="text-xs font-bold text-[var(--text-primary)]">
          {t.groups?.length || 0} ta guruh
        </span>
      ),
    },
    {
      header: 'Amallar',
      className: 'text-right',
      accessor: (t) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => openEditModal(t)}
            className="!p-2 text-[var(--accent)]"
            title="Tahrirlash"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setTeacherToDelete(t);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">O'qituvchilar ro'yxati</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            O'quv markazida dars beruvchi barcha ustozlar va ularning hisoblari
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateModal}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-[var(--shadow-raised)]"
        >
          Yangi o'qituvchi qo'shish
        </Button>
      </div>

      {/* Teachers Table */}
      <Table
        data={teachers}
        columns={columns}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
        emptyMessage="O'qituvchilar topilmadi"
      />

      {/* Add / Edit Teacher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"}
        description="O'qituvchi ma'lumotlari va tizimga kirish hisobini kiriting"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl neu-inset bg-rose-500/10 text-rose-600 text-xs font-semibold">
              {formError}
            </div>
          )}

          <Input
            label="Ism va Familiya"
            placeholder="Masalan: Rustam Ikromov"
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
          </div>

          <fieldset className="space-y-2">
            <legend className="pl-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Fanlar
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {subjectOptions.map(subject => {
                const isSelected = formData.subjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setFormData(current => ({
                      ...current,
                      subjects: isSelected
                        ? current.subjects.filter(selected => selected !== subject)
                        : [...current.subjects, subject],
                    }))}
                    className={`flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                      isSelected
                        ? 'neu-inset text-[var(--accent)]'
                        : 'neu-button text-[var(--text-secondary)]'
                    }`}
                  >
                    {subject}
                    {isSelected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Login"
              placeholder="Masalan: rustam_math"
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              disabled={!!editingTeacher}
              required={!editingTeacher}
            />
            <Input
              label={editingTeacher ? "Yangi parol (ixtiyoriy)" : "Parol"}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingTeacher}
            />
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
              {editingTeacher ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="O'qituvchini o'chirish"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Haqiqatan ham <strong className="text-[var(--text-primary)]">{teacherToDelete?.user.fullName}</strong> ismli o'qituvchini va uning tizimdagi hisobini o'chirmoqchimisiz?
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
