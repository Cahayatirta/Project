import { useEffect, useState } from "react";
import { useRevalidator } from "react-router";
import api from "../../utils/api";
import type { ApiResponse } from "../../utils/types";
import Button from "../Button";
import Modal from "../Modal";

const permissions = [
  {
    id: "canViewScreenTime",
    label: "Screen time",
    description: "Allow friends to see your average screen time.",
  },
  {
    id: "canViewSleepHours",
    label: "Sleep hours",
    description: "Allow friends to see your sleep duration patterns.",
  },
  {
    id: "canViewPhysicalActivity",
    label: "Physical activity",
    description: "Allow friends to monitor your exercise activity.",
  },
  {
    id: "canViewMood",
    label: "Mood",
    description: "Allow friends to see your latest mood logs.",
  },
  {
    id: "canViewWorkHours",
    label: "Work hours",
    description: "Allow friends to see your work duration patterns.",
  },
];

type GroupItem = {
  id: number;
  isDefault: boolean;
  permissions: Record<string, boolean>;
};

export default function ChangePermission({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [permissionState, setPermissionState] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const { revalidate } = useRevalidator();

  useEffect(() => {
    async function loadPermissions() {
      setLoading(true);
      setError(undefined);

      try {
        const { data } = await api.get<ApiResponse<GroupItem[]>>("/groups");
        const defaultGroup = data.data.find((group) => group.isDefault) ?? data.data[0];

        if (!defaultGroup) {
          setError("No group available to update permission.");
          return;
        }

        setGroupId(defaultGroup.id);
        setPermissionState(defaultGroup.permissions ?? {});
        setSelected(
          permissions
            .filter((permission) => defaultGroup.permissions?.[permission.id])
            .map((permission) => permission.id)
        );
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load permissions.");
      } finally {
        setLoading(false);
      }
    }

    void loadPermissions();
  }, []);

  const togglePermission = (permissionId: string) => {
    setSelected((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId]
    );
  };

  async function handleSave() {
    if (!groupId) {
      setError("Default group was not found.");
      return;
    }

    setSaving(true);
    setError(undefined);

    try {
      const nextPermissions: Record<string, boolean> = {
        ...permissionState,
        canViewScreenTime: selected.includes("canViewScreenTime"),
        canViewSleepHours: selected.includes("canViewSleepHours"),
        canViewPhysicalActivity: selected.includes("canViewPhysicalActivity"),
        canViewWorkHours: selected.includes("canViewWorkHours"),
        canViewMood: selected.includes("canViewMood"),
      };

      await api.patch(`/groups/${groupId}/permissions`, {
        canViewScreenTime: Boolean(nextPermissions.canViewScreenTime),
        canViewSleepHours: Boolean(nextPermissions.canViewSleepHours),
        canViewWellnessIndex: Boolean(nextPermissions.canViewWellnessIndex),
        canViewSleepQuality: Boolean(nextPermissions.canViewSleepQuality),
        canViewFatigueScore: Boolean(nextPermissions.canViewFatigueScore),
        canViewDigitalBalance: Boolean(nextPermissions.canViewDigitalBalance),
        canViewScreenTimeCategory: Boolean(nextPermissions.canViewScreenTimeCategory),
        canViewPhysicalActivity: Boolean(nextPermissions.canViewPhysicalActivity),
        canViewCaffeineIntake: Boolean(nextPermissions.canViewCaffeineIntake),
        canViewWorkHours: Boolean(nextPermissions.canViewWorkHours),
        canViewMood: Boolean(nextPermissions.canViewMood),
      });

      await revalidate();
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Change Permission" onClose={onClose}>
      <form className="space-y-4">
        <div>
          <p className="font-semibold text-slate-900">Sharing access</p>
          <p className="mt-1 text-sm text-slate-500">
            Choose what your friends can access from your social profile.
          </p>
        </div>

        <div className="space-y-3">
          {permissions.map((permission) => (
            <label
              key={permission.id}
              htmlFor={permission.id}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white p-3 transition-colors hover:border-primary-400 hover:bg-primary-50"
            >
              <input
                id={permission.id}
                type="checkbox"
                checked={selected.includes(permission.id)}
                onChange={() => togglePermission(permission.id)}
                className="mt-1 size-4 accent-primary-600"
              />
              <span>
                <span className="block font-semibold text-slate-800">
                  {permission.label}
                </span>
                <span className="block text-sm text-slate-500">
                  {permission.description}
                </span>
              </span>
            </label>
          ))}
        </div>

        {loading && <p className="text-sm text-slate-500">Loading permissions...</p>}
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded px-4 py-2 font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <Button type="button" className="justify-center" onClick={() => void handleSave()} disabled={loading || saving}>
            {saving ? "Saving..." : "Save Permission"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
