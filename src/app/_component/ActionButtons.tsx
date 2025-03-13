import { Button, Stack } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useMediaQuery } from '@mantine/hooks'

export function ActionButtons({
  handleEdit,
  setEntryModalOpened,
  setDeleteModalOpened
}: {
  handleEdit: () => void
  setEntryModalOpened: (opened: boolean) => void
  setDeleteModalOpened: (opened: boolean) => void
}) {
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 768px)') // 768px 以下はスマホ表示

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isMobile ? 'center' : 'flex-end', // ✅ スマホ時は中央, PC時は右寄せ
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <Stack
        style={{
          width: isMobile ? '90%' : '300px', // スマホ時は幅を90%、PC時は固定400px
          alignItems: 'center',
          marginRight: isMobile ? '0' : '200px'
        }}
      >
        <Button
          variant="outline"
          style={{
            width: isMobile ? '100%' : '300px', // スマホでは100%にする
            backgroundColor: '#228BE6',
            color: 'white',
            border: 'none'
          }}
          onClick={handleEdit}
        >
          編集する
        </Button>

        <Button
          variant="outline"
          style={{
            width: isMobile ? '100%' : '300px',
            backgroundColor: '#228BE6',
            color: 'white',
            border: 'none'
          }}
          onClick={() => setEntryModalOpened(true)}
        >
          この案件のエントリー一覧を見る
        </Button>

        <Button
          variant="outline"
          style={{
            width: isMobile ? '100%' : '300px',
            backgroundColor: '#e63946',
            color: 'white',
            border: 'none'
          }}
          onClick={() => setDeleteModalOpened(true)}
        >
          この案件を削除する
        </Button>
      </Stack>
    </div>
  )
}

export default ActionButtons
