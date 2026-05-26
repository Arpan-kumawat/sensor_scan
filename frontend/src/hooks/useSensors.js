import { useCallback, useEffect, useState } from 'react';
import {
  createSensor,
  deleteSensor,
  exportSensorsExcel,
  getSensors,
  updateSensor,
} from '../services/api';
import { DUPLICATE_MESSAGE } from '../utils/constants';

export const useSensors = (initialPage = 1, pageSize = 10) => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, totalPages: 1 });
  const [totalCount, setTotalCount] = useState(0);

  const fetchSensors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSensors({ page, limit: pageSize, search });
      setSensors(result.data);
      setPagination(result.pagination);
      setTotalCount(result.totalCount);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load sensors');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchSensors();
  }, [fetchSensors]);

  const saveSensor = async (payload) => {
    try {
      const result = await createSensor(payload);
      await fetchSensors();
      return { success: true, data: result.data };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      if (err.response?.status === 409 || message === DUPLICATE_MESSAGE) {
        return { success: false, duplicate: true, message: DUPLICATE_MESSAGE };
      }
      throw err;
    }
  };

  const removeSensor = async (id) => {
    await deleteSensor(id);
    await fetchSensors();
  };

  const updateSensorComments = async (id, comments) => {
    const result = await updateSensor(id, { comments });
    setSensors((prev) =>
      prev.map((sensor) => (sensor._id === id ? result.data : sensor))
    );
    return result.data;
  };

  const exportExcel = async () => {
    const blob = await exportSensorsExcel();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensor-inventory-${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return {
    sensors,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    pagination,
    totalCount,
    fetchSensors,
    saveSensor,
    removeSensor,
    updateSensorComments,
    exportExcel,
  };
};
