'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { taxpayersApi, Taxpayer } from '@/lib/api';

export default function TaxpayersPage() {
  const router = useRouter();
  const [taxpayers, setTaxpayers] = useState<Taxpayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingTaxpayer, setEditingTaxpayer] = useState<Taxpayer | null>(null);
  const [formData, setFormData] = useState({ name: '', cnic: '', contact: '' });

  useEffect(() => {
    loadTaxpayers();
  }, []);

  const loadTaxpayers = async () => {
    try {
      setLoading(true);
      const data = await taxpayersApi.getAll();
      setTaxpayers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load taxpayers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTaxpayer(null);
    setFormData({ name: '', cnic: '', contact: '' });
    setShowModal(true);
  };

  const handleEdit = (taxpayer: Taxpayer) => {
    setEditingTaxpayer(taxpayer);
    setFormData({ name: taxpayer.name, cnic: taxpayer.cnic, contact: taxpayer.contact });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this taxpayer?')) return;
    try {
      await taxpayersApi.delete(id);
      loadTaxpayers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete taxpayer');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTaxpayer) {
        await taxpayersApi.update(editingTaxpayer.id, formData);
      } else {
        await taxpayersApi.create(formData);
      }
      setShowModal(false);
      loadTaxpayers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save taxpayer');
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Taxpayers</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Taxpayer
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {taxpayers.length === 0 ? (
                <li className="px-6 py-4 text-center text-gray-500">No taxpayers found</li>
              ) : (
                taxpayers.map((taxpayer) => (
                  <li key={taxpayer.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{taxpayer.name}</h3>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>CNIC: {taxpayer.cnic}</p>
                          <p>Contact: {taxpayer.contact}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/taxpayers/${taxpayer.id}`)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleEdit(taxpayer)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(taxpayer.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingTaxpayer ? 'Edit Taxpayer' : 'Add New Taxpayer'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CNIC</label>
                    <input
                      type="text"
                      required
                      value={formData.cnic}
                      onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact</label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingTaxpayer ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}


