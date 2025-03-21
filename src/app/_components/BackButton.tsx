import { Button } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useMediaQuery } from '@mantine/hooks'

export function BackButton() {
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 768px)') // 768px 以下はスマホ表示

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isMobile ? 'center' : 'center',
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'flex-start',
          paddingLeft: isMobile ? '0' : '70%'
        }}
      >
        <Button
          variant="outline"
          style={{
            width: isMobile ? '30px' : 'calc(100% / 3)',
            backgroundColor: '#228BE6',
            color: 'white',
            border: 'none'
          }}
          onClick={() => router.back()}
        >
          戻る
        </Button>
      </div>
    </div>
  )
}

export default BackButton
