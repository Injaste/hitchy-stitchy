import { usePagesModalStore } from "../store/usePagesModalStore"
import { usePagesQuery } from "../queries"
import ThemePickerModal from "./ThemePickerModal"
import PageNameModal from "./PageNameModal"
import ConfirmDeletePageModal from "./ConfirmDeletePageModal"
import ConfirmPublishModal from "./ConfirmPublishModal"

const InvitationModals = () => {
  const {
    isThemePickerOpen,
    isRenameOpen,
    isDeleteOpen,
    isPublishOpen,
    selectedPage,
    closeAll,
  } = usePagesModalStore()

  const { data: pages } = usePagesQuery()
  const hasPublishedPage = pages?.some((p) => p.is_published) ?? false

  return (
    <>
      <ThemePickerModal open={isThemePickerOpen} onOpenChange={(o) => !o && closeAll()} />
      <PageNameModal open={isRenameOpen} onOpenChange={(o) => !o && closeAll()} page={selectedPage} />
      <ConfirmDeletePageModal open={isDeleteOpen} onOpenChange={(o) => !o && closeAll()} page={selectedPage} />
      <ConfirmPublishModal
        open={isPublishOpen}
        onOpenChange={(o) => !o && closeAll()}
        page={selectedPage}
        hasPublishedPage={hasPublishedPage}
      />
    </>
  )
}

export default InvitationModals
