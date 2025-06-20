import {
  getNextPosition,
  getPanelHeight,
  getPanelWidth,
  type MissionValue,
} from "@/app/components/course/utils"

export function NextArrow({
  row,
  col,
  direction,
  nextMissionPair,
  duration = 1,
  type,
}: {
  row: number
  col: number
  direction: MissionValue
  nextMissionPair: MissionValue[]
  duration?: number // 点滅速度（秒）
  type?: string
}) {
  if (nextMissionPair[0] === "mf" || nextMissionPair[0] === "mb") {
    const [nextRow, nextCol] = getNextPosition(
      row,
      col,
      direction,
      nextMissionPair[0],
      nextMissionPair[1],
    )
    return (
      <NextMoveArrow
        row={row}
        col={col}
        nextRow={nextRow}
        nextCol={nextCol}
        duration={duration}
        type={type}
      />
    )
  }
  return (
    <NextTurnArrow
      row={row}
      col={col}
      direction={direction}
      nextMissionPair={nextMissionPair}
      duration={duration}
      type={type}
    />
  )
}

function NextMoveArrow({
  row,
  col,
  nextRow,
  nextCol,
  duration = 1, // 点滅の速度
  type,
}: {
  row: number
  col: number
  nextRow: number
  nextCol: number
  duration?: number // 点滅速度（秒）
  type?: string
}) {
  // 矢印を置く場所・向きの判断
  // (col, row)パネル左上端から矢印起点へのベクトル(colAdd, rowAdd) 単位は [2 / panelWidth] or [2 / panelHeight]
  let colAdd = 0
  let rowAdd = 0
  // 矢印の向き
  let rotate = 0
  if (col < nextCol) {
    // 画面右向きに動く場合
    colAdd = 2
    rowAdd = 1
    rotate = -90
  } else if (col > nextCol) {
    // 画面左向きに動く場合
    colAdd = 0
    rowAdd = 1
    rotate = 90
  } else if (row < nextRow) {
    // 画面下向きに動く場合
    colAdd = 1
    rowAdd = 2
    rotate = 0
  } else if (row > nextRow) {
    // 画面上向きに動く場合
    colAdd = 1
    rowAdd = 0
    rotate = 180
  }

  const midX = ((2 * col + colAdd) * getPanelWidth(type)) / 2
  const midY = ((2 * row + rowAdd) * getPanelHeight(type)) / 2

  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    top: `${midY}px`,
    left: `${midX}px`,
    transform: `rotate(${rotate}deg) translate(0%, 0%)`, // 中央に配置
    animation: `blink ${duration}s step-start infinite`,
    pointerEvents: "none",
  }

  return (
    <>
      <div style={arrowStyle}>
        {/* 矢印表示 */}
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
          .cp_arrows .cp_arrow {/*矢印を配置するベースの設定*/
            position: absolute;
            width: 60px;
            height: 10px;
            opacity: 0;/*スタートは透明*/
            transform: scale(0.3);/*スタートは30%に縮小*/
            animation: arrow-move07 3s ease-out infinite;
          }
          .cp_arrows .cp_arrow:first-child {/*1秒ずらしてアニメーション*/
            animation: arrow-move07 3s ease-out 1s infinite;
          }
          .cp_arrows .cp_arrow:nth-child(2) {/*2秒ずらしてアニメーション*/
            animation: arrow-move07 3s ease-out 2s infinite;
          }
          .cp_arrows .cp_arrow:before,
          .cp_arrows .cp_arrow:after {/*矢印全体の設定*/
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
          .cp_arrows .cp_arrow:before {/*矢印左の線の位置と傾斜*/
            left: 1px;
            transform: skewY(30deg);
          }
          .cp_arrows .cp_arrow:after {/*矢印左の線の位置と傾斜*/
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
  nextMissionPair,
  duration = 1, // 回転の速度
  type,
}: {
  row: number
  col: number
  direction: MissionValue
  nextMissionPair: MissionValue[]
  duration?: number // 回転速度（秒）
  type?: string
}) {
  // panelの幅と高さを取得
  const panelWidth = getPanelWidth(type)
  const panelHeight = getPanelHeight(type)
  // 円の中心を計算
  const midX = (2 * col * panelWidth) / 2
  const midY = (2 * row * panelHeight) / 2

  // 矢印の起点
  let startDeg: number
  let finDeg: number
  let clipDeg: number

  let initArr: number = 0
  // 矢印の頭の描画位置initArrは右回転時left: 100% 左回転時: 0%
  // 左回転の時は座標系を180度rotateしてする負方向が回転の方向になる
  if (nextMissionPair[0] === "tr") {
    // 右回転
    initArr = 100
    startDeg = getStartDeg(direction)
    finDeg = startDeg + Number(nextMissionPair[1])
    clipDeg = startDeg + 90
  } else {
    // 左回転
    initArr = 0
    startDeg = getStartDeg(direction) + 180
    finDeg = startDeg - Number(nextMissionPair[1])
    clipDeg = startDeg + 180
  }

  // 矢印の線を切り取るclippath
  const clipPath: string = getClipPath(Number(nextMissionPair[1]))

  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    top: `${midY}px`,
    left: `${midX}px`,
    pointerEvents: "none",
  }

  return (
    <>
      <div style={arrowStyle}>
        {/* 矢印表示 */}
        <span className="arc"></span>
        <span className="turnArrow"></span>
      </div>

      <style>
        {`
        span.turnArrow {
        position: relative;
        display: inline-block;
        width: ` +
          `${panelWidth}` +
          `px;
        height: ` +
          `${panelHeight}` +
          `px;
        border: 0px solid #FF0033;

        border-radius: 50%; /* 円形にする */
        animation: rotating ${duration}s linear infinite;
        }
        
        /*矢印*/
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

        /*回転*/
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
        /* 円弧 */
        span.arc {
        position: absolute;
        display: inline-block;
        width: ` +
          `${panelWidth}` +
          `px;
        height: ` +
          `${panelHeight}` +
          `px;
        border: 2px solid #FF0033;
        border-radius: 50%; /* 円形にする */
        transform: rotate(` +
          `${clipDeg}` +
          `deg); /* 矢印をロボの頭起点にするためrotate入れる */

        /* 円弧を表示するためのクリップパス */
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

// MissionValueから回転角度(90度単位)を取得する関数
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

// MissionValue(degree)から矢印の線を切り取るclippathの形状を決定する関数
function getClipPath(degree: MissionValue): string {
  switch (degree) {
    case 90:
      return "polygon(50% 50%, 100% 50%, 100% 0%, 50% 0%); // 1/4円弧"
    case 180:
      return "polygon(50% 100%, 100% 100%, 100% 0%, 50% 0%); // 半円弧"
    case 270:
      return "polygon(-50% 100%, 100% 100%, 100% 0%, 50% 0%); // 3/4円弧"
    default:
      return "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%); // 円"
  }
}
