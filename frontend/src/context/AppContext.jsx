// ─────────────────────────────────────────────────────────────
// context/AppContext.jsx
//
// Single source of truth for Cars, Suppliers, Customers,
// Applications, Users, Notifications, Activity and Settings.
//
// This now talks to the real backend (Express + Sequelize +
// PostgreSQL — see /backend) through the api/*Api.js service files,
// instead of reading/writing LocalStorage directly. The public
// shape of useApp() is unchanged on purpose — every page that
// already calls things like saveCar(), deleteSupplier(),
// updateApplication() keeps working with zero changes.
//
// Activity-log rows and Notifications are now written by the
// backend itself (see backend/src/utils/activity.js) whenever a
// Car/Supplier/Customer/Application is created, updated or deleted,
// so this file just refreshes those two lists afterwards instead of
// writing them locally the way the old LocalStorage version did.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCarsApi, createCarApi, updateCarApi, deleteCarApi } from "../services/carApi";
import {
  getSuppliersApi,
  createSupplierApi,
  updateSupplierApi,
  deleteSupplierApi,
} from "../services/supplierApi";
import {
  getCustomersApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
} from "../services/customerApi";
import {
  getApplicationsApi,
  createApplicationApi,
  updateApplicationStatusApi,
  assignManagerApi,
  selectVehicleApi,
} from "../services/applicationApi";
import { getUsersApi } from "../services/userApi";
import { getNotificationsByUserApi, markNotificationReadApi } from "../services/notificationApi";
import { getActivityApi } from "../services/activityApi";
import { getSettingsApi, updateSettingsApi } from "../services/settingApi";
import { getData } from "../services/localStorageService";
import { STORAGE } from "../utils/constants";

const C = createContext(null);

// Notifications are per-user server-side, but this context is mounted
// once above auth/routing, so it re-reads "who's currently logged in"
// from the same session key AuthContext writes to (STORAGE.SESSION)
// each time it needs to refresh the notification list.
function currentSessionUserId() {
  const session = getData(STORAGE.SESSION, null);
  return session?.id || null;
}

export function AppProvider({ children }) {
  const [cars, setCars] = useState([]),
    [suppliers, setSuppliers] = useState([]),
    [customers, setCustomers] = useState([]),
    [applications, setApplications] = useState([]),
    [users, setUsers] = useState([]),
    [notifications, setNotifications] = useState([]),
    [activity, setActivity] = useState([]),
    [settings, setSettings] = useState({ darkMode: true }),
    [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(null);

  const refreshNotifications = async () => {
    const userId = currentSessionUserId();
    if (!userId) return setNotifications([]);
    try {
      setNotifications(await getNotificationsByUserApi(userId));
    } catch {
      /* non-fatal — bell just stays empty */
    }
  };

  const refreshActivity = async () => {
    try {
      setActivity(await getActivityApi(100));
    } catch {
      /* non-fatal */
    }
  };

  const refresh = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [carsData, suppliersData, customersData, applicationsData, usersData, settingsData] =
        await Promise.all([
          getCarsApi(),
          getSuppliersApi(),
          getCustomersApi(),
          getApplicationsApi(),
          getUsersApi(),
          getSettingsApi(),
        ]);
      setCars(carsData);
      setSuppliers(suppliersData);
      setCustomers(customersData);
      setApplications(applicationsData);
      setUsers(usersData);
      setSettings(settingsData);
      await Promise.all([refreshNotifications(), refreshActivity()]);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Only pull business data once we actually have a session — hitting
  // these endpoints unauthenticated (e.g. while sitting on /login)
  // would just 401 and bounce right back via services/api.js's
  // interceptor. Re-runs on every login/logout via the same
  // "udevs:auth-changed" event AuthContext dispatches.
  useEffect(() => {
    const maybeRefresh = () => {
      if (localStorage.getItem(STORAGE.TOKEN)) refresh();
      else {
        setCars([]);
        setSuppliers([]);
        setCustomers([]);
        setApplications([]);
        setUsers([]);
        setNotifications([]);
        setActivity([]);
        setLoading(false);
      }
    };
    maybeRefresh();
    window.addEventListener("udevs:auth-changed", maybeRefresh);
    return () => window.removeEventListener("udevs:auth-changed", maybeRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cars ─────────────────────────────────────────────────────
  const saveCar = async (car, performedBy = "System") => {
    const payload = { ...car, performedBy };
    const exists = cars.some((x) => x.id === car.id);
    const saved = exists ? await updateCarApi(car.id, payload) : await createCarApi(payload);
    setCars((prev) => (exists ? prev.map((x) => (x.id === saved.id ? saved : x)) : [...prev, saved]));
    await refreshActivity();
    return saved;
  };

  const deleteCar = async (id, performedBy = "System") => {
    await deleteCarApi(id, { performedBy });
    setCars((prev) => prev.filter((x) => x.id !== id));
    await refreshActivity();
  };

  // ── Suppliers ────────────────────────────────────────────────
  const saveSupplier = async (s, performedBy = "System") => {
    const payload = { ...s, performedBy };
    const exists = suppliers.some((x) => x.id === s.id);
    const saved = exists ? await updateSupplierApi(s.id, payload) : await createSupplierApi(payload);
    setSuppliers((prev) => (exists ? prev.map((x) => (x.id === saved.id ? saved : x)) : [...prev, saved]));
    await refreshActivity();
    return saved;
  };

  const deleteSupplier = async (id, performedBy = "System") => {
    await deleteSupplierApi(id, { performedBy });
    setSuppliers((prev) => prev.filter((x) => x.id !== id));
    await refreshActivity();
  };

  // ── Customers ────────────────────────────────────────────────
  const saveCustomer = async (c, performedBy = "System") => {
    const payload = { ...c, performedBy };
    const exists = customers.some((x) => x.id === c.id);
    const saved = exists ? await updateCustomerApi(c.id, payload) : await createCustomerApi(payload);
    setCustomers((prev) => (exists ? prev.map((x) => (x.id === saved.id ? saved : x)) : [...prev, saved]));
    await refreshActivity();
    return saved;
  };

  const deleteCustomer = async (id, performedBy = "System") => {
    await deleteCustomerApi(id, { performedBy });
    setCustomers((prev) => prev.filter((x) => x.id !== id));
    await refreshActivity();
  };

  // ── Applications ─────────────────────────────────────────────
  const saveApplication = async (a, performedBy = "System") => {
    const saved = await createApplicationApi({ ...a, performedBy });
    setApplications((prev) => [...prev, saved]);
    await Promise.all([refreshActivity(), refreshNotifications()]);
    return saved;
  };

  const updateApplication = async (id, patch, performedBy = "Staff") => {
    // Status-only update — section 8/20 workflow transitions. Super
    // Admin approves/rejects; Manager advances verification/delivery.
    const saved = await updateApplicationStatusApi(id, { status: patch.status, performedBy });
    setApplications((prev) => prev.map((a) => (a.id === id ? saved : a)));
    await Promise.all([refreshActivity(), refreshNotifications()]);
    return saved;
  };

  // Super Admin only — section 4 "Only Super Admin assigns the Manager".
  const assignManager = async (id, managerId, performedBy = "Super Admin") => {
    const saved = await assignManagerApi(id, managerId, performedBy);
    setApplications((prev) => prev.map((a) => (a.id === id ? saved : a)));
    await Promise.all([refreshActivity(), refreshNotifications()]);
    return saved;
  };

  // Manager/Customer — attaches the chosen vehicle to the application
  // (section 6/18 "Manager selects vehicle for assigned customer").
  const selectVehicle = async (id, carId, performedBy = "Manager") => {
    const saved = await selectVehicleApi(id, carId, performedBy);
    setApplications((prev) => prev.map((a) => (a.id === id ? saved : a)));
    await refreshActivity();
    return saved;
  };

  // ── Settings ─────────────────────────────────────────────────
  const saveSettings = async (s) => {
    const saved = await updateSettingsApi(s);
    setSettings(saved);
    return saved;
  };

  // ── Notifications ────────────────────────────────────────────
  const markRead = async (id) => {
    const saved = await markNotificationReadApi(id);
    setNotifications((prev) => prev.map((x) => (x.id === id ? saved : x)));
  };

  // Re-pull notifications whenever the logged-in user changes. Cross-tab
  // logins fire the native "storage" event; same-tab login/logout fires
  // the custom "udevs:auth-changed" event dispatched by AuthContext.
  useEffect(() => {
    const onAuthChanged = () => refreshNotifications();
    window.addEventListener("storage", onAuthChanged);
    window.addEventListener("udevs:auth-changed", onAuthChanged);
    return () => {
      window.removeEventListener("storage", onAuthChanged);
      window.removeEventListener("udevs:auth-changed", onAuthChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // There's no "wipe and reseed" endpoint on the backend on purpose
  // (that's a destructive, shared-database action, not something a
  // browser button should be able to trigger against real Postgres
  // data). This just re-fetches whatever is currently in the
  // database. Run `npm run db:seed` in /backend to restore the demo
  // dataset instead.
  const resetDemo = () => refresh();

  const value = useMemo(
    () => ({
      cars,
      suppliers,
      customers,
      applications,
      users,
      notifications,
      activity,
      settings,
      loading,
      loadError,
      saveCar,
      deleteCar,
      saveSupplier,
      deleteSupplier,
      saveCustomer,
      deleteCustomer,
      saveApplication,
      updateApplication,
      assignManager,
      selectVehicle,
      saveSettings,
      markRead,
      resetDemo,
      refresh,
    }),
    [cars, suppliers, customers, applications, users, notifications, activity, settings, loading, loadError]
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useApp = () => useContext(C);
