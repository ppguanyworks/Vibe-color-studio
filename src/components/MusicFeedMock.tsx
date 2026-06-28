import type { CSSProperties } from 'react'
import { tuxPreview, tuxType, previewScale as s } from '../tokens/tux-preview'

import signalIcon from '../assets/feed-mock/signal.svg'
import wifiIcon from '../assets/feed-mock/wifi.svg'
import batteryIcon from '../assets/feed-mock/battery.svg'
import liveIcon from '../assets/feed-mock/live.svg'
import searchIcon from '../assets/feed-mock/search.svg'
import tabHomeIcon from '../assets/feed-mock/tab-home.svg'
import tabFriendsIcon from '../assets/feed-mock/tab-friends.svg'
import tabCreateIcon from '../assets/feed-mock/tab-create.svg'
import tabInboxIcon from '../assets/feed-mock/tab-inbox.svg'
import tabMeIcon from '../assets/feed-mock/tab-me.svg'

function Icon({ src, size, alt = '' }: { src: string; size: number; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className="block shrink-0 max-w-none"
      style={{ width: size, height: size }}
    />
  )
}

function SizedIcon({ src, width, height, alt = '' }: { src: string; width: number; height: number; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className="block shrink-0"
      style={{ width, height }}
    />
  )
}

/** Figma System Status Bar (380:59116) icon bounds at 390pt width. */
const STATUS_ICONS = {
  signal: { w: 21.298, h: 12.798 },
  wifi: { w: 17.68, h: 13 },
  battery: { w: 29.432, h: 14 },
} as const

function StatusBar() {
  return (
    <div className="relative flex items-center shrink-0" style={{ height: s(47), padding: `0 ${s(16)}px` }}>
      <span
        style={{
          fontSize: s(17),
          fontWeight: 590,
          color: tuxPreview.text1,
          letterSpacing: -0.34,
        }}
      >
        9:41
      </span>
      <div className="ml-auto flex items-center" style={{ gap: s(7) }}>
        <SizedIcon src={signalIcon} width={s(STATUS_ICONS.signal.w)} height={s(STATUS_ICONS.signal.h)} />
        <SizedIcon src={wifiIcon} width={s(STATUS_ICONS.wifi.w)} height={s(STATUS_ICONS.wifi.h)} />
        <SizedIcon src={batteryIcon} width={s(STATUS_ICONS.battery.w)} height={s(STATUS_ICONS.battery.h)} />
      </div>
    </div>
  )
}

function HomeNavBar() {
  const tabStyle = (active: boolean): CSSProperties => ({
    fontSize: s(tuxType.h3Medium.size),
    fontWeight: active ? tuxType.h3Bold.weight : tuxType.h3Medium.weight,
    lineHeight: tuxType.h3Medium.lineHeight,
    color: active ? tuxPreview.text1 : tuxPreview.text3,
  })

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ height: s(44) }}>
      <div className="absolute" style={{ left: s(16) }}>
        <Icon src={liveIcon} size={s(24)} />
      </div>
      <div className="absolute" style={{ right: s(16) }}>
        <Icon src={searchIcon} size={s(24)} />
      </div>
      <div className="flex items-start" style={{ gap: s(16), paddingTop: s(11) }}>
        <span style={tabStyle(false)}>Following</span>
        <div className="flex flex-col items-center" style={{ gap: s(7) }}>
          <span style={tabStyle(true)}>For You</span>
          <span
            style={{
              width: s(24),
              height: s(2),
              borderRadius: s(0.5),
              background: tuxPreview.text1,
            }}
          />
        </div>
      </div>
    </div>
  )
}

function FeedCard() {
  return (
    <div
      className="w-full shrink-0"
      style={{
        borderRadius: s(tuxPreview.radiusCard),
        background: tuxPreview.imagePlaceholder,
      }}
    >
      <div
        className="flex flex-col items-start w-full"
        style={{
          padding: `${s(24)}px ${s(24)}px ${s(20)}px`,
          gap: s(6),
        }}
      >
        <div className="flex flex-col items-start w-full" style={{ gap: s(2) }}>
          <h1
            style={{
              margin: 0,
              fontSize: s(tuxType.h1Bold.size),
              fontWeight: tuxType.h1Bold.weight,
              lineHeight: tuxType.h1Bold.lineHeight,
              color: tuxPreview.textWhite,
            }}
          >
            Title
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: s(tuxType.p2Semibold.size),
              fontWeight: tuxType.p2Semibold.weight,
              lineHeight: tuxType.p2Semibold.lineHeight,
              color: tuxPreview.text3,
            }}
          >
            Subtitle
          </p>
        </div>
      </div>

      <div style={{ padding: `0 ${s(24)}px ${s(24)}px` }}>
        <div
          className="w-full"
          style={{
            aspectRatio: '326 / 407',
            borderRadius: s(tuxPreview.radiusImage),
            background: tuxPreview.imagePlaceholder,
          }}
        />
      </div>
    </div>
  )
}

function ButtonGroup() {
  const baseBtn: CSSProperties = {
    flex: 1,
    height: s(tuxPreview.buttonHeightL),
    borderRadius: s(tuxPreview.radiusContentCapsule),
    border: 'none',
    fontSize: s(tuxType.headlineSemibold.size),
    fontWeight: tuxType.headlineSemibold.weight,
    lineHeight: tuxType.headlineSemibold.lineHeight,
    cursor: 'default',
    padding: `${s(8)}px ${s(16)}px`,
  }

  return (
    <div className="flex w-full shrink-0" style={{ gap: s(8) }}>
      <button
        type="button"
        style={{
          ...baseBtn,
          background: tuxPreview.shapeNeutral4,
          color: tuxPreview.text1,
        }}
      >
        Not interested
      </button>
      <button
        type="button"
        style={{
          ...baseBtn,
          background: tuxPreview.shapeNeutral,
          color: tuxPreview.textOnNeutral,
        }}
      >
        Main action
      </button>
    </div>
  )
}

/** Figma App Nav Bar (380:59118) — tab icon frame sizes at 390pt. */
const TAB_ICONS = {
  regular: { size: 32, top: 2 },
  create: { frame: 48, iconW: 43, iconH: 28 },
} as const

function AppNavBar() {
  type Tab = { label: string | null; icon: string; active: boolean; create?: boolean }
  const tabs: Tab[] = [
    { label: 'Home', icon: tabHomeIcon, active: true },
    { label: 'Friends', icon: tabFriendsIcon, active: false },
    { label: null, icon: tabCreateIcon, active: false, create: true },
    { label: 'Inbox', icon: tabInboxIcon, active: false },
    { label: 'Me', icon: tabMeIcon, active: false },
  ]

  return (
    <div className="relative shrink-0" style={{ height: s(49), background: tuxPreview.pageFlat1 }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: 0.5, background: tuxPreview.shapeNeutral3 }} />
      <div className="flex h-full">
        {tabs.map((tab) => (
          <div
            key={tab.label ?? 'create'}
            className="relative flex-1 flex flex-col items-center"
            style={{ paddingTop: tab.create ? 0 : s(TAB_ICONS.regular.top) }}
          >
            {tab.create ? (
              <div
                className="flex items-center justify-center shrink-0"
                style={{ width: s(TAB_ICONS.create.frame), height: s(TAB_ICONS.create.frame) }}
              >
                <SizedIcon
                  src={tab.icon}
                  width={s(TAB_ICONS.create.iconW)}
                  height={s(TAB_ICONS.create.iconH)}
                />
              </div>
            ) : (
              <Icon src={tab.icon} size={s(TAB_ICONS.regular.size)} alt={tab.label ?? ''} />
            )}
            {tab.label && (
              <span
                style={{
                  marginTop: s(1),
                  fontSize: s(tuxType.smallText2Medium.size),
                  fontWeight: tuxType.smallText2Medium.weight,
                  lineHeight: tuxType.smallText2Medium.lineHeight,
                  letterSpacing: tuxType.smallText2Medium.letterSpacing,
                  color: tab.active ? tuxPreview.text1 : tuxPreview.text3,
                }}
              >
                {tab.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function HomeIndicator() {
  return (
    <div
      className="flex items-end justify-center shrink-0"
      style={{ height: s(34), paddingBottom: s(8), background: tuxPreview.pageFlat1 }}
    >
      <span
        style={{
          width: s(140),
          height: s(5),
          borderRadius: s(29),
          background: tuxPreview.textWhite,
        }}
      />
    </div>
  )
}

/** Figma feed mock (node 380:59109) — TUX tokens, scaled to phone preview. */
export function MusicFeedMock() {
  return (
    <div className="relative z-[2] h-full flex flex-col overflow-hidden">
      <StatusBar />
      <HomeNavBar />

      <div
        className="flex-1 flex flex-col items-center justify-center min-h-0"
        style={{ padding: `0 ${s(16)}px`, gap: s(16) }}
      >
        <FeedCard />
        <ButtonGroup />
      </div>

      <AppNavBar />
      <HomeIndicator />
    </div>
  )
}
