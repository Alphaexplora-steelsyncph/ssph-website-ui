import { Camera, Trash2 } from 'lucide-react'
import { PhotoCapture } from '../../../../shared/components/PhotoCapture'
import type { MemberDetailVM } from '../viewModels/useMemberDetailViewModel'

/** The front desk takes the member's photo (webcam or file) and can remove it. */
export const MemberPhotoControls = ({ vm }: { vm: MemberDetailVM }) => (
  <div className="mt-2 text-sm">
    {!vm.photoUrl && <p className="text-steel">No photo yet. Take one so the desk can match the member at check-in.</p>}
    {vm.canEdit && (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {!vm.confirmingPhotoRemoval && (
          <button
            type="button"
            onClick={vm.openCapture}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ember px-3 py-1.5 font-semibold text-charcoal hover:bg-ember-600"
          >
            <Camera size={14} /> {vm.photoUrl ? 'Retake photo' : 'Take photo'}
          </button>
        )}
        {vm.photoUrl && (
          <>
            {vm.confirmingPhotoRemoval && <span className="text-amber-300">Remove this photo?</span>}
            <button
              type="button"
              onClick={vm.removePhoto}
              disabled={vm.isRemovingPhoto}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-1.5 font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-60"
            >
              <Trash2 size={14} /> {vm.confirmingPhotoRemoval ? (vm.isRemovingPhoto ? 'Removing…' : 'Yes, remove photo') : 'Remove photo'}
            </button>
            {vm.confirmingPhotoRemoval && !vm.isRemovingPhoto && (
              <button type="button" onClick={vm.cancelPhotoRemoval} className="px-2 py-1.5 font-semibold text-steel hover:text-zinc-100">
                Cancel
              </button>
            )}
          </>
        )}
      </div>
    )}
    {vm.photoError && <p role="alert" className="mt-1 text-red-300">{vm.photoError}</p>}
    {vm.capturing && <PhotoCapture title={`Photo of ${vm.member?.fullName ?? 'member'}`} isSaving={vm.isSavingPhoto} onCapture={vm.savePhoto} onClose={vm.closeCapture} />}
  </div>
)
