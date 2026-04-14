import { Pause } from "lucide-react"
import { getNextPosition } from "@/app/lib/course/mission"
import { type MissionValue, PANEL_SIZE } from "@/app/lib/course/types"

// Shared cell positioning style for overlays
function getCellStyle({
  row,
  col,
  responsive,
}: {
  row: number
  col: number
  responsive?: boolean
}): React.CSSProperties {
  if (responsive) {
    return {
      position: "absolute",
      top: `calc(var(--cell-size) * ${row})`,
      left: `calc(var(--cell-size) * ${col})`,
      height: "var(--cell-size)",
      width: "var(--cell-size)",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }
  }
  return {
    position: "absolute",
    top: `${row * PANEL_SIZE}px`,
    left: `${col * PANEL_SIZE}px`,
    height: `${PANEL_SIZE}px`,
    width: `${PANEL_SIZE}px`,
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
}

export function NextArrow({
  row,
  col,
  direction,
  nextMission,
  duration = 1,
  responsive,
}: {
  row: number
  col: number
  direction: MissionValue
  nextMission: MissionValue[] | undefined
  duration?: number
  responsive?: boolean
}) {
  if (
    !nextMission ||
    nextMission[0] === null ||
    nextMission[1] === null ||
    nextMission[0] === undefined ||
    nextMission[1] === undefined
  ) {
    return null
  }
  if (nextMission[0] === "mf" || nextMission[0] === "mb") {
    const [nextRow, nextCol] = getNextPosition(
      row,
      col,
      direction,
      nextMission[0],
      nextMission[1],
    )
    return (
      <NextMoveArrow
        row={row}
        col={col}
        nextRow={nextRow}
        nextCol={nextCol}
        duration={duration}
        responsive={responsive}
      />
    )
  }
  if (nextMission[0] === "ps") {
    return <NextPauseIndicator row={row} col={col} responsive={responsive} />
  }
  return (
    <NextTurnArrow
      row={row}
      col={col}
      direction={direction}
      nextMission={nextMission}
      duration={duration}
      responsive={responsive}
    />
  )
}

function NextMoveArrow({
  row,
  col,
  nextRow,
  nextCol,
  duration = 1,
  responsive,
}: {
  row: number
  col: number
  nextRow: number
  nextCol: number
  duration?: number
  responsive?: boolean
}) {
  let colAdd = 0
  let rowAdd = 0
  let rotate = 0
  if (col < nextCol) {
    colAdd = 2
    rowAdd = 1
    rotate = -90
  } else if (col > nextCol) {
    colAdd = 0
    rowAdd = 1
    rotate = 90
  } else if (row < nextRow) {
    colAdd = 1
    rowAdd = 2
    rotate = 0
  } else if (row > nextRow) {
    colAdd = 1
    rowAdd = 0
    rotate = 180
  }

  const arrowStyle: React.CSSProperties = responsive
    ? {
        position: "absolute",
        top: `calc(var(--cell-size) * ${(2 * row + rowAdd) / 2})`,
        left: `calc(var(--cell-size) * ${(2 * col + colAdd) / 2})`,
        transform: `rotate(${rotate}deg)`,
        animation: `blink ${duration}s step-start infinite`,
        pointerEvents: "none",
      }
    : {
        position: "absolute",
        top: `${((2 * row + rowAdd) * PANEL_SIZE) / 2}px`,
        left: `${((2 * col + colAdd) * PANEL_SIZE) / 2}px`,
        transform: `rotate(${rotate}deg)`,
        animation: `blink ${duration}s step-start infinite`,
        pointerEvents: "none",
      }

  return (
    <>
      <div style={arrowStyle}>
        <div className="cp_arrows">
          <div className="cp_arrow" />
          <div className="cp_arrow" />
          <div className="cp_arrow" />
        </div>
      </div>

      <style>
        {`
          .cp_arrows {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .cp_arrows .cp_arrow {
            position: absolute;
            width: 60px;
            height: 10px;
            opacity: 0;
            transform: scale(0.3);
            animation: arrow-move07 3s ease-out infinite;
          }
          .cp_arrows .cp_arrow:first-child {
            animation: arrow-move07 3s ease-out 1s infinite;
          }
          .cp_arrows .cp_arrow:nth-child(2) {
            animation: arrow-move07 3s ease-out 2s infinite;
          }
          .cp_arrows .cp_arrow:before,
          .cp_arrows .cp_arrow:after {
            position: absolute;
            content: '';
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 50%;
            height: 100%;
            background: #2196f3;
            border-radius: 2px;
          }
          .cp_arrows .cp_arrow:before {
            left: 1px;
            transform: skewY(30deg);
          }
          .cp_arrows .cp_arrow:after {
            right: 1px;
            transform: skewY(-30deg);
          }
          @keyframes arrow-move07 {
            25% { opacity: 0.6;}
            43% { transform: translateY(1em); opacity: 0.8;}
            62% { transform: translateY(2em); opacity: 1;}
            100% { transform: translateY(3em) scale(0.5); opacity: 0;}
          }
        `}
      </style>
    </>
  )
}

function NextTurnArrow({
  row,
  col,
  direction,
  nextMission,
  duration = 1,
  responsive,
}: {
  row: number
  col: number
  direction: MissionValue
  nextMission: MissionValue[]
  duration?: number
  responsive?: boolean
}) {
  let startDeg: number
  let finDeg: number
  let clipDeg: number
  let initArr = 0

  if (nextMission[0] === "tr") {
    initArr = 100
    startDeg = getStartDeg(direction)
    finDeg = startDeg + Number(nextMission[1])
    clipDeg = startDeg + 90
  } else {
    initArr = 0
    startDeg = getStartDeg(direction) + 180
    finDeg = startDeg - Number(nextMission[1])
    clipDeg = startDeg + 180
  }

  const clipPath: string = getClipPath(Number(nextMission[1]))
  const sizeExpr = responsive ? "var(--cell-size)" : `${PANEL_SIZE}px`

  const arrowStyle: React.CSSProperties = responsive
    ? {
        position: "absolute",
        top: `calc(var(--cell-size) * ${row})`,
        left: `calc(var(--cell-size) * ${col})`,
        pointerEvents: "none",
      }
    : {
        position: "absolute",
        top: `${row * PANEL_SIZE}px`,
        left: `${col * PANEL_SIZE}px`,
        pointerEvents: "none",
      }

  return (
    <>
      <div style={arrowStyle}>
        <span className="arc" />
        <span className="turnArrow" />
      </div>

      <style>
        {`
        span.turnArrow {
          position: relative;
          display: inline-block;
          width: ${sizeExpr};
          height: ${sizeExpr};
          border: 0px solid #FF0033;
          border-radius: 50%;
          animation: rotating ${duration}s linear infinite;
        }
        span.turnArrow:after {
          position: absolute;
          display: inline-block;
          content: " ";
          left: ${initArr}%;
          top: 50%;
          margin-top: -20px;
          margin-left: -10px;
          border: 10px solid transparent;
          border: 10px solid rgba(0, 0, 0, 0);
          border-top: 20px solid #FF0033;
        }
        @keyframes rotating {
          0% { transform: rotate(${startDeg}deg); }
          100% { transform: rotate(${finDeg}deg); }
        }
        span.arc {
          position: absolute;
          display: inline-block;
          width: ${sizeExpr};
          height: ${sizeExpr};
          border: 2px solid #FF0033;
          border-radius: 50%;
          transform: rotate(${clipDeg}deg);
          clip-path: ${clipPath}
          animation: blink 2s linear infinite;
        }
        @keyframes blink {
          25% { opacity: 0.6;}
          43% { opacity: 0.8;}
          62% { opacity: 1;}
          100% { opacity: 0;}
        }
        `}
      </style>
    </>
  )
}

function getStartDeg(direction: MissionValue): number {
  switch (direction) {
    case "u":
      return -90
    case "r":
      return 0
    case "d":
      return 90
    case "l":
      return 180
    default:
      return 0
  }
}

export function NextPauseIndicator({
  row,
  col,
  responsive,
}: {
  row: number
  col: number
  responsive?: boolean
}) {
  return (
    <div style={getCellStyle({ row, col, responsive })}>
      <div className="pause-indicator flex h-3/4 w-3/4 items-center justify-center rounded-full bg-warning/25 ring-2 ring-warning/40">
        <Pause
          className="h-1/2 w-1/2 text-warning drop-shadow-sm"
          fill="currentColor"
        />
      </div>
    </div>
  )
}

function getClipPath(degree: MissionValue): string {
  switch (degree) {
    case 90:
      return "polygon(50% 50%, 100% 50%, 100% 0%, 50% 0%); // 1/4 arc"
    case 180:
      return "polygon(50% 100%, 100% 100%, 100% 0%, 50% 0%); // Half arc"
    case 270:
      return "polygon(-50% 100%, 100% 100%, 100% 0%, 50% 0%); // 3/4 arc"
    default:
      return "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%); // Full circle"
  }
}
