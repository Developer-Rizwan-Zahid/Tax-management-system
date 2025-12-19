'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { taxSlabsApi, TaxSlab } from '@/lib/api';

export default function TaxSlabsPage() {
  const [slabs, setSlabs] = useState<TaxSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingSlab, setEditingSlab] = useState<TaxSlab | null>(null);
  const [formData, setFormData] = useState({ fromAmount: 0, toAmount: 0, ratePercent: 0 });

  useEffect(() => {
    loadSlabs();
  }, []);

  const loadSlabs = async () => {
    try {
      setLoading(true);
      const data = await taxSlabsApi.getAll();
      setSlabs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tax slabs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSlab(null);
    setFormData({ fromAmount: 0, toAmount: 0, ratePercent: 0 });
    setShowModal(true);
  };

  const handleEdit = (slab: TaxSlab) => {
    setEditingSlab(slab);
    setFormData({ fromAmount: slab.fromAmount, toAmount: slab.toAmount, ratePercent: slab.ratePercent });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tax slab?')) return;
    try {
      await taxSlabsApi.delete(id);
      loadSlabs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete tax slab');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlab) {
        await taxSlabsApi.update(editingSlab.id, formData);
      } else {
        await taxSlabsApi.create(formData);
      }
      setShowModal(false);
      loadSlabs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save tax slab');
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tax Slabs</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Tax Slab
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
            {slabs.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">No tax slabs found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        To Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {slabs.map((slab) => (
                      <tr key={slab.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {slab.fromAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {slab.toAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {slab.ratePercent.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(slab)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(slab.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingSlab ? 'Edit Tax Slab' : 'Add New Tax Slab'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">From Amount</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.fromAmount}
                      onChange={(e) => setFormData({ ...formData, fromAmount: parseFloat(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">To Amount</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.toAmount}
                      onChange={(e) => setFormData({ ...formData, toAmount: parseFloat(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rate Percent</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.ratePercent}
                      onChange={(e) => setFormData({ ...formData, ratePercent: parseFloat(e.target.value) })}
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
                    {editingSlab ? 'Update' : 'Create'}
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


