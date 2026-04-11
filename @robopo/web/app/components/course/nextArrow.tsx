import {
  getNextPosition,
  type MissionValue,
  PANEL_SIZE,
} from "@/app/components/course/utils"

export function NextArrow({
  row,
  col,
  direction,
  nextMission,
  duration = 1,
}: {
  row: number
  col: number
  direction: MissionValue
  nextMission: MissionValue[] | undefined
  duration?: number // Blink speed (seconds)
}) {
  if (
    !nextMission ||
    nextMission[0] === null ||
    nextMission[1] === null ||
    nextMission[0] === undefined ||
    nextMission[1] === undefined
  ) {
    // Show nothing if there is no next mission
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
      />
    )
  }
  return (
    <NextTurnArrow
      row={row}
      col={col}
      direction={direction}
      nextMission={nextMission}
      duration={duration}
    />
  )
}

function NextMoveArrow({
  row,
  col,
  nextRow,
  nextCol,
  duration = 1, // Blink speed
}: {
  row: number
  col: number
  nextRow: number
  nextCol: number
  duration?: number // Blink speed (seconds)
}) {
  // Determine arrow placement and direction
  let colAdd = 0
  let rowAdd = 0
  // Arrow direction
  let rotate = 0
  if (col < nextCol) {
    // Moving right on screen
    colAdd = 2
    rowAdd = 1
    rotate = -90
  } else if (col > nextCol) {
    // Moving left on screen
    colAdd = 0
    rowAdd = 1
    rotate = 90
  } else if (row < nextRow) {
    // Moving down on screen
    colAdd = 1
    rowAdd = 2
    rotate = 0
  } else if (row > nextRow) {
    // Moving up on screen
    colAdd = 1
    rowAdd = 0
    rotate = 180
  }

  const midX = ((2 * col + colAdd) * PANEL_SIZE) / 2
  const midY = ((2 * row + rowAdd) * PANEL_SIZE) / 2

  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    top: `${midY}px`,
    left: `${midX}px`,
    transform: `rotate(${rotate}deg) translate(0%, 0%)`, // Center placement
    animation: `blink ${duration}s step-start infinite`,
    pointerEvents: "none",
  }

  return (
    <>
      <div style={arrowStyle}>
        {/* Arrow display */}
        <div className="cp_arrows">
          <div className="cp_arrow"></div>
          <div className="cp_arrow"></div>
          <div className="cp_arrow"></div>
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
          .cp_arrows .cp_arrow {/* Base settings for arrow placement */
            position: absolute;
            width: 60px;
            height: 10px;
            opacity: 0;/* Start transparent */
            transform: scale(0.3);/* Start at 30% scale */
            animation: arrow-move07 3s ease-out infinite;
          }
          .cp_arrows .cp_arrow:first-child {/* Animation delayed by 1s */
            animation: arrow-move07 3s ease-out 1s infinite;
          }
          .cp_arrows .cp_arrow:nth-child(2) {/* Animation delayed by 2s */
            animation: arrow-move07 3s ease-out 2s infinite;
          }
          .cp_arrows .cp_arrow:before,
          .cp_arrows .cp_arrow:after {/* Arrow overall settings */
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
          .cp_arrows .cp_arrow:before {/* Arrow line position and skew */
            left: 1px;
            transform: skewY(30deg);
          }
          .cp_arrows .cp_arrow:after {/* Arrow line position and skew */
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
  duration = 1, // Rotation speed
}: {
  row: number
  col: number
  direction: MissionValue
  nextMission: MissionValue[]
  duration?: number // Rotation speed (seconds)
}) {
  // Calculate circle center
  const midX = (2 * col * PANEL_SIZE) / 2
  const midY = (2 * row * PANEL_SIZE) / 2

  // Arrow starting point
  let startDeg: number
  let finDeg: number
  let clipDeg: number

  let initArr: number = 0
  // Arrow head draw position initArr: left 100% for right rotation, 0% for left rotation
  // For left rotation, rotate coordinate system 180 degrees so negative direction becomes rotation direction
  if (nextMission[0] === "tr") {
    // Right rotation
    initArr = 100
    startDeg = getStartDeg(direction)
    finDeg = startDeg + Number(nextMission[1])
    clipDeg = startDeg + 90
  } else {
    // Left rotation
    initArr = 0
    startDeg = getStartDeg(direction) + 180
    finDeg = startDeg - Number(nextMission[1])
    clipDeg = startDeg + 180
  }

  // Clip path to trim the arrow line
  const clipPath: string = getClipPath(Number(nextMission[1]))

  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    top: `${midY}px`,
    left: `${midX}px`,
    pointerEvents: "none",
  }

  return (
    <>
      <div style={arrowStyle}>
        {/* Arrow display */}
        <span className="arc"></span>
        <span className="turnArrow"></span>
      </div>

      <style>
        {`
        span.turnArrow {
        position: relative;
        display: inline-block;
        width: ` +
          `${PANEL_SIZE}` +
          `px;
        height: ` +
          `${PANEL_SIZE}` +
          `px;
        border: 0px solid #FF0033;

        border-radius: 50%; /* Make circular */
        animation: rotating ${duration}s linear infinite;
        }
        
        /* Arrow */
        span.turnArrow:after {
            position: absolute;
            display: inline-block;
            content: " ";
            left: ` +
          `${initArr}` +
          `%;
            top: 50%;
            margin-top: -20px;
            margin-left: -10px;
            border: 10px solid transparent;
            border: 10px solid rgba(0, 0, 0, 0);
            border-top: 20px solid #FF0033;
        }

        /* Rotation */
        @keyframes rotating {
            0% {
                transform: rotate(` +
          `${startDeg}` +
          `deg);
            }
            100% {
                transform: rotate(` +
          `${finDeg}` +
          `deg);
            }
        }
        /* Arc */
        span.arc {
        position: absolute;
        display: inline-block;
        width: ` +
          `${PANEL_SIZE}` +
          `px;
        height: ` +
          `${PANEL_SIZE}` +
          `px;
        border: 2px solid #FF0033;
        border-radius: 50%; /* Make circular */
        transform: rotate(` +
          `${clipDeg}` +
          `deg); /* Rotate to position arrow at robot head */

        /* Clip path to display the arc */
        clip-path: ` +
          `${clipPath}` +
          `

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

// Get rotation angle (in 90-degree units) from MissionValue
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

// Determine clip path shape for arrow line from MissionValue (degree)
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
