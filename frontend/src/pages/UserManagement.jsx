import React, { useState, useEffect } from 'react';
import { fetchUsers, updateUserRole, updateUserStatus, createUser } from '../api/client';
import { useApp } from '../context/AppContext';

export default function UserManagement() {
  const { showToast, currentUser } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('Nurse');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Nurse');
  const [newUserWard, setNewUserWard] = useState('Isolation Ward B');
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      showToast('Directory Error', err.message || 'Failed to load user directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleConfirmRoleChange = async () => {
    if (!roleModalUser) return;
    setSubmitting(true);
    try {
      const res = await updateUserRole(roleModalUser.id, selectedNewRole);
      if (res.success) {
        showToast(
          'Role Reassigned & Sealed',
          `${roleModalUser.name} reassigned to role [${selectedNewRole}] in cryptographic ledger`,
          'success'
        );
        setRoleModalUser(null);
        loadUsers();
      }
    } catch (err) {
      showToast('Update Failed', err.message || 'Error updating user role', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const targetStatus = !user.active;
    try {
      const res = await updateUserStatus(user.id, targetStatus);
      if (res.success) {
        showToast(
          targetStatus ? 'Account Activated' : 'Account Deactivated',
          `${user.name} is now ${targetStatus ? 'ACTIVE' : 'DEACTIVATED'}.`,
          'info'
        );
        loadUsers();
      }
    } catch (err) {
      showToast('Status Update Failed', err.message || 'Error updating status', 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createUser({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        ward: newUserWard
      });
      if (res.success) {
        showToast('Staff Registered', `Account created for ${newUserName} with role [${newUserRole}]`, 'success');
        setShowAddModal(false);
        setNewUserName('');
        setNewUserEmail('');
        loadUsers();
      }
    } catch (err) {
      showToast('Registration Error', err.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-3.5 sm:p-space-lg rounded-2xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[26px]">manage_accounts</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-telemetry-unit text-xs uppercase tracking-widest text-primary font-bold">
                Administrator Governance • Staff Permissions &amp; RBAC
              </span>
            </div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              Staff User Management &amp; Role Assignments
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Manage clinical accounts, activate/deactivate access, and govern role scopes with audit trail
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Register New Staff</span>
        </button>
      </div>

      {/* User Directory Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm p-space-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div>
            <h2 className="font-label-lg text-base font-bold text-on-surface">
              Authorized Biocontainment Staff Directory
            </h2>
            <span className="text-xs text-on-surface-variant">
              Role permissions strictly enforced in API gateway and SHA-256 block ledger
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-surface-container text-primary font-telemetry-unit text-xs font-bold">
            {users.length} REGISTERED USERS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-surface-container text-xs text-on-surface-variant uppercase font-semibold">
                <th className="pb-3">Staff Member</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Assigned Ward / Service</th>
                <th className="pb-3">Badge ID</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-surface-container-low/50">
                  <td className="py-3">
                    <div className="font-bold text-primary">{u.name}</div>
                    <div className="text-xs text-on-surface-variant">{u.email}</div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      u.role === 'Admin' ? 'bg-primary text-on-primary' :
                      u.role === 'Doctor' ? 'bg-primary-container text-on-primary' :
                      'bg-secondary-fixed text-on-secondary-fixed'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-on-surface-variant font-medium">
                    {u.ward}
                  </td>
                  <td className="py-3 font-telemetry-unit text-xs text-primary font-bold">
                    {u.badge}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-600' : 'bg-outline'}`}></span>
                      {u.active ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setRoleModalUser(u);
                          setSelectedNewRole(u.role);
                        }}
                        className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs"
                      >
                        Reassign Role
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors ${
                          u.active
                            ? 'text-error hover:bg-error/10'
                            : 'text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Confirmation Dialog */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-6 flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <span className="text-xs uppercase font-bold text-primary tracking-wider">
                  Role Assignment Confirmation
                </span>
                <h3 className="text-xl font-bold text-on-surface">
                  {roleModalUser.name}
                </h3>
              </div>
              <button onClick={() => setRoleModalUser(null)} className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-amber-700 text-[20px] flex-shrink-0">warning</span>
              <p>
                <strong>Security Impact:</strong> Reassigning roles will immediately alter the user's accessible dashboards, permission matrix, and API authorization scopes. This action will be permanently sealed into the SHA-256 Merkle audit block ledger.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant">Select New Approved Role</label>
              <div className="grid grid-cols-3 gap-2">
                {['Nurse', 'Doctor', 'Admin'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedNewRole(r)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedNewRole === r
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmRoleChange}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-md"
              >
                {submitting ? 'Confirming...' : 'Confirm Role Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-6 flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <span className="text-xs uppercase font-bold text-primary tracking-wider">
                  New Staff Registration
                </span>
                <h3 className="text-xl font-bold text-on-surface">
                  Create Biocontainment Staff Account
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Full Name &amp; Credentials</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Helena Rossi, MD"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Facility Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. h.rossi@quarantinecare.org"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Approved Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm"
                  >
                    <option value="Nurse">Nurse</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Assigned Ward</label>
                  <select
                    value={newUserWard}
                    onChange={(e) => setNewUserWard(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm"
                  >
                    <option value="Isolation Ward A">Isolation Ward A</option>
                    <option value="Isolation Ward B">Isolation Ward B</option>
                    <option value="Isolation Ward C">Isolation Ward C</option>
                    <option value="Isolation Ward D">Isolation Ward D</option>
                    <option value="Biocontainment Service">Biocontainment Service</option>
                    <option value="Operations Command">Operations Command</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-md"
                >
                  {submitting ? 'Creating...' : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
