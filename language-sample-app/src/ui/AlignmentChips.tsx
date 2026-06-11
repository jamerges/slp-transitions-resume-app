import type { AlignedSegment } from '../engine/types'
import { phoneToString } from '../engine/tokenize'

export function AlignmentChips({ alignment }: { alignment: AlignedSegment[] }) {
  return (
    <>
      {alignment.map((seg, i) => {
        let label: string
        switch (seg.status) {
          case 'correct':
            label = phoneToString(seg.target!)
            break
          case 'substitution':
          case 'distortion':
            label = `${phoneToString(seg.target!)}→${phoneToString(seg.actual!)}`
            break
          case 'omission':
            label = phoneToString(seg.target!)
            break
          case 'addition':
            label = `+${phoneToString(seg.actual!)}`
            break
        }
        return (
          <span key={i} className={`seg ${seg.status}`} title={seg.status}>
            {label}
          </span>
        )
      })}
    </>
  )
}
