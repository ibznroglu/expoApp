import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import { octagonPath, octagonInnerPath } from '@/utils/octagonPath';
import { profileCardStyles as cardStyles } from '@/assets/styles/profileCardStyle';

const CORNER_CUT = 22;
const FRAME_THICKNESS = 10;
const DASH_INSET = 8;
const STUD_RADIUS = 4;
const DIAMOND_SIZE = 9;
const HEX_RADIUS = 40;
const DEFAULT_CARD = { width: 320, height: 240 };

interface ProfileCardProps {
  name: string;
  email: string;
  isGuest: boolean;
  scoreValue?: string;
  accuracyValue?: string;
}

function localClamp(w: number, h: number, cut: number): number {
  const maxCut = Math.min(w, h) / 2;
  return Math.max(0, Math.min(cut, maxCut));
}

export default function ProfileCard({ name, email, isGuest, scoreValue, accuracyValue }: ProfileCardProps) {
  const initials = useMemo(() => {
    const source = name?.trim() || email?.trim() || '';
    const parts = source.split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : source.slice(0, 2).toUpperCase() || '?';
  }, [name, email]);

  const [cardSize, setCardSize] = useState(DEFAULT_CARD);
  const handleCardLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCardSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height }
      );
    }
  };

  const W = cardSize.width;
  const H = cardSize.height;
  const dashBorder = FRAME_THICKNESS + DASH_INSET; // = 18
  const o = dashBorder;
  const innerW = W - 2 * o;
  const innerH = H - 2 * o;
  const c = localClamp(innerW, innerH, Math.max(0, CORNER_CUT - dashBorder));
  const hexCx = W / 2;
  const hexCy = FRAME_THICKNESS + DASH_INSET + Spacing.xl + HEX_RADIUS; // = 82

  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = ((60 * i - 30) * Math.PI) / 180;
    return { x: hexCx + HEX_RADIUS * Math.cos(angle), y: hexCy + HEX_RADIUS * Math.sin(angle) };
  });
  const hexPath = hexPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';

  const studs = [
    { x: o + c, y: o },
    { x: o + innerW - c, y: o },
    { x: o + innerW, y: o + c },
    { x: o + innerW, y: o + innerH - c },
    { x: o + innerW - c, y: o + innerH },
    { x: o + c, y: o + innerH },
    { x: o, y: o + innerH - c },
    { x: o, y: o + c },
  ];

  const diamonds = [
    { cx: o + innerW / 2, cy: o },
    { cx: o + innerW / 2, cy: o + innerH },
    { cx: o, cy: o + innerH / 2 },
    { cx: o + innerW, cy: o + innerH / 2 },
  ];

  return (
    <View onLayout={handleCardLayout} style={cardStyles.cardWrapper}>
      <Svg width={W} height={H} style={cardStyles.svgBackground} pointerEvents="none">
        <Defs>
          <SvgLinearGradient id="profileFrameGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={Colors.gradients.profileFrame[0]} />
            <Stop offset="1" stopColor={Colors.gradients.profileFrame[1]} />
          </SvgLinearGradient>
          <SvgLinearGradient id="profileCardFillGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={Colors.gradients.profileCardFill[0]} />
            <Stop offset="1" stopColor={Colors.gradients.profileCardFill[1]} />
          </SvgLinearGradient>
        </Defs>

        {/* Outer coral frame */}
        <Path
          d={octagonPath({ width: W, height: H, cut: CORNER_CUT })}
          fill="url(#profileFrameGrad)"
        />

        {/* Dark inner panel */}
        <Path
          d={octagonInnerPath({ width: W, height: H, cut: CORNER_CUT }, FRAME_THICKNESS)}
          fill="url(#profileCardFillGrad)"
        />

        {/* Dashed gold border */}
        <Path
          d={octagonInnerPath({ width: W, height: H, cut: CORNER_CUT }, dashBorder)}
          fill="none"
          stroke={Colors.accent.gold}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />

        {/* Corner studs (8) */}
        {studs.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={STUD_RADIUS} fill={Colors.accent.gold} />
        ))}

        {/* Side diamonds (4) */}
        {diamonds.map((d, i) => (
          <Path
            key={i}
            d={`M ${d.cx},${d.cy - DIAMOND_SIZE} L ${d.cx + DIAMOND_SIZE},${d.cy} L ${d.cx},${d.cy + DIAMOND_SIZE} L ${d.cx - DIAMOND_SIZE},${d.cy} Z`}
            fill={Colors.accent.gold}
          />
        ))}

        {/* Hexagon avatar */}
        <Path
          d={hexPath}
          fill={Colors.brand.primary}
          stroke={Colors.accent.gold}
          strokeWidth={1.5}
        />
        <SvgText
          x={hexCx}
          y={hexCy}
          textAnchor="middle"
          dy="0.35em"
          fill={Colors.text.primary}
          fontSize={Typography.size.xxl}
          fontWeight="bold"
        >
          {initials}
        </SvgText>
      </Svg>

      {/* Content layer (normal flow, on top of SVG) */}
      <View style={cardStyles.content}>
        {/* Spacer to clear the SVG hexagon avatar */}
        <View style={{ height: hexCy + HEX_RADIUS + Spacing.md }} />
        <ThemedText weight="bold" size={Typography.size.xxl} numberOfLines={1} color={Colors.text.primary} style={cardStyles.name}>
          {name || 'Oyuncu'}
        </ThemedText>
        <View style={[cardStyles.badge, isGuest ? cardStyles.badgeGuest : cardStyles.badgeMember]}>
          <Ionicons
            name={isGuest ? 'person-outline' : 'shield-checkmark'}
            size={14}
            color={isGuest ? Colors.brand.primary : Colors.accent.teal}
          />
          <ThemedText weight="bold" size={Typography.size.md} color={isGuest ? Colors.brand.primary : Colors.accent.teal}>
            {isGuest ? 'Misafir' : 'Üye'}
          </ThemedText>
        </View>
        <View style={cardStyles.chipRow}>
          {[
            { label: 'Skor', value: scoreValue ?? '—', style: cardStyles.chipSkor, labelColor: Colors.accent.gold },
            { label: 'Doğruluk', value: accuracyValue ?? '—', style: cardStyles.chipGold, labelColor: Colors.accent.teal },
          ].map(({ label, value, style, labelColor }) => (
            <View key={label} style={style}>
              <ThemedText weight="bold" size={Typography.size.md} color={labelColor}>{label}</ThemedText>
              <ThemedText weight="regular" size={Typography.size.sm} color={Colors.text.secondary}>{value}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
