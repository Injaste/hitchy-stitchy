import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

import { useAdminStore } from '../../../store/useAdminStore'
import { useCreateRoleMutation, useUpdateRoleMutation } from '../../queries'
import type { Role } from '../../types'
import type { RoleCategory } from '../../../types'

interface RoleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
}

export function RoleModal({ open, onOpenChange, role }: RoleModalProps) {
  const { eventId } = useAdminStore()
  const isEditing = !!role

  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [category, setCategory] = useState<RoleCategory>('general')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (role) {
      setName(role.name)
      setShortName(role.shortName)
      setCategory(role.category)
      setDescription(role.description ?? '')
    } else {
      setName('')
      setShortName('')
      setCategory('general')
      setDescription('')
    }
  }, [role, open])

  const { mutate: create, isPending: creating } = useCreateRoleMutation()
  const { mutate: update, isPending: updating } = useUpdateRoleMutation()
  const isPending = creating || updating

  const handleSubmit = () => {
    if (!name.trim() || !shortName.trim()) return
    if (isEditing && role) {
      update({ ...role, name, shortName, category, description })
    } else {
      create({ eventId, name, shortName, category, description })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Role' : 'Add Role'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update role details.' : 'Create a new team role.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="role-name">Name</Label>
              <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-short">Short Name</Label>
              <Input id="role-short" value={shortName} onChange={(e) => setShortName(e.target.value)} maxLength={10} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as RoleCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Root</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="bridesmaid">Bridesmaid</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-desc">Description</Label>
            <Textarea id="role-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isEditing ? 'Save' : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
