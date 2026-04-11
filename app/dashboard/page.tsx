'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Calendar } from '@/components/calendar/Calendar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllUsers } from '@/services/admin.service';
import { User } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load employees if admin and set default user
  useEffect(() => {
    if (user?.role === 'admin') {
      loadEmployees();
    }
    // Set logged-in user as default
    if (user && selectedUserId === '') {
      setSelectedUserId(user.id);
    }
  }, [user, selectedUserId]);

  const loadEmployees = async () => {
    try {
      const employeesList = await getAllUsers();
      setEmployees(employeesList);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fizyocentro</h1>
              <p className="text-sm text-gray-600">
                Hoş geldiniz, {user.name} ({user.role === 'admin' ? 'Admin' : 'Çalışan'})
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Employee Selector for Admin */}
              {user.role === 'admin' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Çalışan Seç:
                  </label>
                  <Select
                    value={selectedUserId}
                    onValueChange={(value) => {
                      if (value) {
                        setSelectedUserId(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue>
                        {selectedUserId
                          ? employees.find(e => e.id === selectedUserId)?.name || user.name
                          : user.name
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button variant="outline" onClick={handleSignOut}>
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Randevu Takvimi
            </h2>
            <p className="text-sm text-gray-600">
              {user.role === 'admin'
                ? selectedUserId
                  ? `${employees.find((e) => e.id === selectedUserId)?.name || ''} için randevular`
                  : 'Tüm randevuları görüntülüyorsunuz'
                : 'Kendi randevularınızı görüntülüyorsunuz'}
            </p>
          </div>

          <Calendar selectedUserId={selectedUserId} />

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Nasıl Kullanılır?</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Yeni randevu oluşturmak için takvimde boş bir zaman dilimine tıklayın</li>
              <li>Mevcut randevuyu düzenlemek veya silmek için randevuya tıklayın</li>
              <li>Hafta ve gün görünümleri arasında geçiş yapabilirsiniz</li>
              {user.role === 'admin' && (
                <li>Admin olarak tüm çalışanların randevularını görebilir ve yönetebilirsiniz</li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
