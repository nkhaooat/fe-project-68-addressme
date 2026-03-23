'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getServices, createService, updateService, deleteService, Service } from '@/libs/services';
import { getShops, Shop } from '@/libs/shops';

interface PaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

const emptyService: Omit<Service, '_id'> = {
  name: '',
  area: 'full body',
  duration: 60,
  oil: 'none',
  price: 0,
  sessions: 1,
  description: '',
  shop: ''
};

const areaOptions = ['full body', 'back', 'foot', 'head', 'shoulder', 'face', 'other'];
const oilOptions = ['none', 'aromatherapy', 'herbal', 'coconut', 'jojoba', 'other'];

export default function AdminServicesPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [services, setServices] = useState<Service[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Omit<Service, '_id'>>(emptyService);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [shopFilter, setShopFilter] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch services and shops in parallel
        const [servicesRes, shopsRes] = await Promise.all([
          getServices(),
          getShops({ limit: 100 })
        ]);
        
        if (servicesRes.success) {
          setServices(servicesRes.data);
          setPagination(servicesRes.pagination);
        } else {
          setError(servicesRes.message || 'Failed to load services');
        }
        
        if (shopsRes.success) {
          setShops(shopsRes.data);
        }
      } catch {
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    }

    if (token && user?.role === 'admin') {
      fetchData();
    }
  }, [token, user]);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesShop = !shopFilter || (typeof service.shop === 'string' ? service.shop === shopFilter : service.shop._id === shopFilter);
    return matchesSearch && matchesShop;
  });

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData(emptyService);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      area: service.area,
      duration: service.duration,
      oil: service.oil,
      price: service.price,
      sessions: service.sessions,
      description: service.description || '',
      shop: service.shop
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData(emptyService);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let res;
      if (editingService) {
        res = await updateService(editingService._id, formData, token!);
      } else {
        res = await createService(formData, token!);
      }
      
      if (res.success) {
        // Refresh services
        const servicesRes = await getServices();
        if (servicesRes.success) {
          setServices(servicesRes.data);
        }
        handleCloseModal();
      } else {
        alert(res.message || `Failed to ${editingService ? 'update' : 'create'} service`);
      }
    } catch {
      alert(`Error ${editingService ? 'updating' : 'creating'} service`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, serviceName: string) => {
    if (!confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) return;

    try {
      const res = await deleteService(id, token!);
      if (res.success) {
        setServices(services.filter(s => s._id !== id));
      } else {
        alert(res.message || 'Failed to delete service');
      }
    } catch {
      alert('Error deleting service');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' || name === 'sessions' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const getShopName = (shop: string | { _id: string; name: string }) => {
    return typeof shop === 'object' ? shop.name : shops.find(s => s._id === shop)?.name || 'Unknown Shop';
  };

  if (user?.role !== 'admin') {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-red-400 text-xl">Access Denied</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#E57A00] text-xl">Loading services...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#F0E5D8]">
            Manage Services (Admin)
          </h1>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
          >
            + Add New Service
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8A8177] text-sm mb-2">Search Services</label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#8A8177] text-sm mb-2">Filter by Shop</label>
              <select
                value={shopFilter}
                onChange={(e) => setShopFilter(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
              >
                <option value="">All Shops</option>
                {shops.map(shop => (
                  <option key={shop._id} value={shop._id}>{shop.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[#403A36]">
            <p className="text-[#8A8177] text-sm">
              Showing {filteredServices.length} of {services.length} services
            </p>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1A1A1A]">
                <tr>
                  <th className="text-left px-4 py-3 text-[#8A8177] font-medium">Service Name</th>
                  <th className="text-left px-4 py-3 text-[#8A8177] font-medium">Shop</th>
                  <th className="text-left px-4 py-3 text-[#8A8177] font-medium">Area</th>
                  <th className="text-left px-4 py-3 text-[#8A8177] font-medium">Duration</th>
                  <th className="text-left px-4 py-3 text-[#8A8177] font-medium">Price</th>
                  <th className="text-left px-4 py-3 text-[#8A8177] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#403A36]">
                {filteredServices.map((service) => (
                  <tr key={service._id} className="hover:bg-[#333333]">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[#F0E5D8] font-medium">{service.name}</p>
                        {service.description && (
                          <p className="text-[#8A8177] text-sm truncate max-w-xs">{service.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#D4CFC6]">{getShopName(service.shop)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-[#454545] rounded text-[#D4CFC6] text-sm capitalize">
                        {service.area}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#D4CFC6]">{service.duration} min</td>
                    <td className="px-4 py-3 text-[#D4CFC6]">฿{service.price}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEditModal(service)}
                          className="px-3 py-1 bg-[#E57A00] text-[#1A110A] rounded hover:bg-[#c46a00] transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service._id, service.name)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-[#8A8177] text-lg">
              {searchQuery || shopFilter ? 'No services match your filters' : 'No services found'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
            >
              Add Your First Service
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#F0E5D8]">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-[#8A8177] hover:text-[#F0E5D8] text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[#8A8177] text-sm mb-1">Service Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Thai Traditional Massage"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[#8A8177] text-sm mb-1">Shop *</label>
                    <select
                      name="shop"
                      value={typeof formData.shop === 'string' ? formData.shop : formData.shop._id}
                      onChange={handleInputChange}
                      required
                      disabled={!!editingService}
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none disabled:opacity-50"
                    >
                      <option value="">Select a shop...</option>
                      {shops.map(shop => (
                        <option key={shop._id} value={shop._id}>{shop.name}</option>
                      ))}
                    </select>
                    {editingService && (
                      <p className="text-[#8A8177] text-xs mt-1">Shop cannot be changed when editing</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Massage Area *</label>
                    <select
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    >
                      {areaOptions.map(area => (
                        <option key={area} value={area} className="capitalize">{area}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Duration (minutes) *</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      min="15"
                      step="15"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Oil Type</label>
                    <select
                      name="oil"
                      value={formData.oil}
                      onChange={handleInputChange}
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    >
                      {oilOptions.map(oil => (
                        <option key={oil} value={oil} className="capitalize">{oil}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Price (฿) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Sessions</label>
                    <input
                      type="number"
                      name="sessions"
                      value={formData.sessions}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[#8A8177] text-sm mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Describe the service..."
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-[#454545] text-[#D4CFC6] rounded hover:bg-[#5a5a5a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
