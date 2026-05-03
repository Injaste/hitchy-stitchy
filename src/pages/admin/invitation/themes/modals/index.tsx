import { useThemesModalStore } from "../../store/useThemesModalStore"
import { useThemesQuery } from "../queries"
import PageNameModal from "./PageNameModal"
import ConfirmDeletePageModal from "./ConfirmDeletePageModal"
import ConfirmPublishModal from "./ConfirmPublishModal"

const ThemesModals = () => {
  const {
    isRenameOpen,
    isDeleteOpen,
    isPublishOpen,
    selectedTheme,
    closeAll,
  } = useThemesModalStore()

  const { data: themes } = useThemesQuery()
  const hasPublishedTheme = themes?.some((t) => t.is_published) ?? false

  return (
    <>
      <PageNameModal open={isRenameOpen} onOpenChange={(o) => !o && closeAll()} page={selectedTheme} />
      <ConfirmDeletePageModal open={isDeleteOpen} onOpenChange={(o) => !o && closeAll()} page={selectedTheme} />
      <ConfirmPublishModal
        open={isPublishOpen}
        onOpenChange={(o) => !o && closeAll()}
        page={selectedTheme}
        hasPublishedPage={hasPublishedTheme}
      />
    </>
  )
}

export default ThemesModals
