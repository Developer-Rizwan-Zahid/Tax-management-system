'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { taxpayersApi, incomeEntriesApi, taxCalculationsApi, Taxpayer, IncomeEntry, TaxCalculation } from '@/lib/api';
import { format } from 'date-fns';

export default function TaxpayerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const taxpayerId = params.id as string;

  const [taxpayer, setTaxpayer] = useState<Taxpayer | null>(null);
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeEntry | null>(null);
  const [incomeFormData, setIncomeFormData] = useState({ date: '', type: '', amount: 0 });

  useEffect(() => {
    if (taxpayerId) {
      loadData();
    }
  }, [taxpayerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [taxpayerData, incomesData] = await Promise.all([
        taxpayersApi.getById(taxpayerId),
        incomeEntriesApi.getByTaxpayerId(taxpayerId),
      ]);
      setTaxpayer(taxpayerData);
      setIncomes(incomesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateTax = async () => {
    try {
      const calc = await taxCalculationsApi.calculate(taxpayerId);
      setCalculation(calc);
      alert(`Tax calculated: ${calc.taxAmount.toFixed(2)}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to calculate tax');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const blob = await taxCalculationsApi.getReport(taxpayerId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TaxReport_${taxpayer?.name}_${new Date().toISOString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to download report');
    }
  };

  const handleAddIncome = () => {
    setEditingIncome(null);
    setIncomeFormData({ date: new Date().toISOString().split('T')[0], type: '', amount: 0 });
    setShowIncomeModal(true);
  };

  const handleEditIncome = (income: IncomeEntry) => {
    setEditingIncome(income);
    setIncomeFormData({
      date: income.date.split('T')[0],
      type: income.type,
      amount: income.amount,
    });
    setShowIncomeModal(true);
  };

  const handleDeleteIncome = async (incomeId: string) => {
    if (!confirm('Are you sure you want to delete this income entry?')) return;
    try {
      await incomeEntriesApi.delete(taxpayerId, incomeId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete income entry');
    }
  };

  const handleSubmitIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIncome) {
        await incomeEntriesApi.update(taxpayerId, editingIncome.id, incomeFormData);
      } else {
        await incomeEntriesApi.create(taxpayerId, incomeFormData);
      }
      setShowIncomeModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save income entry');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!taxpayer) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 text-red-600">Taxpayer not found</div>
        </div>
      </ProtectedRoute>
    );
  }

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/taxpayers')}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Taxpayers
        </button>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{taxpayer.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">CNIC</p>
              <p className="text-lg font-medium">{taxpayer.cnic}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="text-lg font-medium">{taxpayer.contact}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-lg font-medium">{totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Income Entries</h2>
            <button
              onClick={handleAddIncome}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Income Entry
            </button>
          </div>

          {incomes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No income entries found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {incomes.map((income) => (
                    <tr key={income.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(income.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {income.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {income.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditIncome(income)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(income.id)}
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

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tax Calculation</h2>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={handleCalculateTax}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Calculate Tax
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Download PDF Report
            </button>
          </div>
          {calculation && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">{calculation.totalIncome.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">Tax Amount</p>
              <p className="text-2xl font-bold text-green-600">{calculation.taxAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-2">
                Calculated at: {format(new Date(calculation.calculatedAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          )}
        </div>

        {showIncomeModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingIncome ? 'Edit Income Entry' : 'Add Income Entry'}
              </h3>
              <form onSubmit={handleSubmitIncome}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      required
                      value={incomeFormData.date}
                      onChange={(e) => setIncomeFormData({ ...incomeFormData, date: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <input
                      type="text"
                      required
                      value={incomeFormData.type}
                      onChange={(e) => setIncomeFormData({ ...incomeFormData, type: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Salary, Business, Rental"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={incomeFormData.amount}
                      onChange={(e) => setIncomeFormData({ ...incomeFormData, amount: parseFloat(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowIncomeModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingIncome ? 'Update' : 'Create'}
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


