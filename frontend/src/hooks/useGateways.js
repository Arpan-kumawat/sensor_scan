import { useCallback, useEffect, useState } from 'react';
import {
  createGateway,
  deleteGateway,
  exportGatewaysExcel,
  getGateways,
  updateGateway,
} from '../services/api';
import { DUPLICATE_GATEWAY_MESSAGE } from '../utils/constants';

export const useGateways = (initialPage = 1, pageSize = 10) => {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
  });
  const [totalCount, setTotalCount] = useState(0);

  const fetchGateways = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getGateways({ page, limit: pageSize, search });
      setGateways(result.data);
      setPagination(result.pagination);
      setTotalCount(result.totalCount);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load gateways');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  const saveGateway = async (payload) => {
    try {
      const result = await createGateway(payload);
      await fetchGateways();
      return { success: true, data: result.data };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      if (err.response?.status === 409 || message === DUPLICATE_GATEWAY_MESSAGE) {
        return { success: false, duplicate: true, message: DUPLICATE_GATEWAY_MESSAGE };
      }
      throw err;
    }
  };

  const removeGateway = async (id) => {
    await deleteGateway(id);
    await fetchGateways();
  };

  const updateGatewayComments = async (id, comments) => {
    const result = await updateGateway(id, { comments });
    setGateways((prev) =>
      prev.map((gateway) => (gateway._id === id ? result.data : gateway))
    );
    return result.data;
  };

  const exportExcel = async () => {
    const blob = await exportGatewaysExcel();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gateway-inventory-${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return {
    gateways,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    pagination,
    totalCount,
    fetchGateways,
    saveGateway,
    removeGateway,
    updateGatewayComments,
    exportExcel,
  };
};
