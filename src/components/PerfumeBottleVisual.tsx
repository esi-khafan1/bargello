'use client';

import React from 'react';
import type { Product } from '@/lib/types';

interface PerfumeBottleVisualProps {
  product: Pick<
    Product,
    | 'code'
    | 'collection_type'
    | 'scent_family'
    | 'volume_ml'
    | 'concentration'
    | 'bottle_tint'
    | 'image_url'
    | 'name_fa'
  >;
  size?: 'sm' | 'md' | 'lg';
}

export const PerfumeBottleVisual: React.FC<PerfumeBottleVisualProps> = ({
  product,
  size = 'md',
}) => {
  if (product.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.image_url}
        alt={product.name_fa}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          padding: size === 'sm' ? 6 : 16,
        }}
      />
    );
  }

  const accent = product.bottle_tint || '#B8924E';
  const maxHeight = size === 'sm' ? 88 : size === 'lg' ? 320 : 215;

  if (product.collection_type === 'niche') {
    return (
      <svg
        viewBox="0 0 220 280"
        style={{ width: '100%', maxHeight, height: 'auto', display: 'block' }}
        role="img"
        aria-label={product.name_fa}
      >
        <defs>
          <linearGradient
            id={`nicheBody-${product.code || 'x'}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#262320" />
            <stop offset="55%" stopColor="#121110" />
            <stop offset="100%" stopColor="#2e261c" />
          </linearGradient>
          <linearGradient id="goldSheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9d7835" />
            <stop offset="50%" stopColor="#e2c280" />
            <stop offset="100%" stopColor="#9a7432" />
          </linearGradient>
        </defs>
        <ellipse cx="110" cy="256" rx="64" ry="8" fill="rgba(18,18,18,0.12)" />
        <rect x="82" y="24" width="56" height="42" rx="3" fill="url(#goldSheen)" />
        <rect x="94" y="66" width="32" height="12" fill="#8b692c" />
        <rect
          x="52"
          y="78"
          width="116"
          height="172"
          rx="6"
          fill={`url(#nicheBody-${product.code || 'x'})`}
          stroke={accent}
          strokeWidth="1.5"
        />
        <rect
          x="59"
          y="85"
          width="102"
          height="158"
          rx="3"
          fill="none"
          stroke="rgba(226,194,128,0.28)"
          strokeWidth="1"
        />
        <rect x="68" y="112" width="84" height="104" rx="2" fill="url(#goldSheen)" />
        <rect x="72" y="116" width="76" height="96" fill="#151412" />
        <text
          x="110"
          y="141"
          textAnchor="middle"
          fill="#e2c280"
          fontFamily="Georgia, serif"
          fontSize="10.5"
          fontWeight="700"
          letterSpacing="2.2"
        >
          BARGELLO
        </text>
        <text
          x="110"
          y="163"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="Georgia, serif"
          fontSize="11"
          fontWeight="700"
          letterSpacing="1.6"
        >
          NICHE
        </text>
        <line x1="86" y1="173" x2="134" y2="173" stroke="#b8924e" strokeWidth="0.8" />
        <text
          x="110"
          y="189"
          textAnchor="middle"
          fill="#d4b475"
          fontFamily="sans-serif"
          fontSize="6.8"
          letterSpacing="1.3"
        >
          EXTRAIT DE PARFUM
        </text>
        <text
          x="110"
          y="203"
          textAnchor="middle"
          fill="#a99f91"
          fontFamily="sans-serif"
          fontSize="7.5"
        >
          {product.volume_ml} ml
        </text>
      </svg>
    );
  }

  if (product.collection_type === 'body_mist') {
    return (
      <svg
        viewBox="0 0 220 280"
        style={{ width: '100%', maxHeight, height: 'auto', display: 'block' }}
        role="img"
        aria-label={product.name_fa}
      >
        <ellipse cx="110" cy="258" rx="44" ry="7" fill="rgba(18,18,18,0.1)" />
        <rect
          x="90"
          y="20"
          width="40"
          height="42"
          rx="4"
          fill="rgba(255,255,255,0.75)"
          stroke="#d5cdc0"
        />
        <rect x="97" y="34" width="26" height="28" rx="2" fill="#d4af72" />
        <rect
          x="74"
          y="62"
          width="72"
          height="192"
          rx="14"
          fill={accent}
          fillOpacity="0.45"
          stroke="#d5cdc0"
          strokeWidth="1.4"
        />
        <rect
          x="80"
          y="104"
          width="60"
          height="108"
          rx="3"
          fill="rgba(255,255,255,0.92)"
        />
        <text
          x="110"
          y="134"
          textAnchor="middle"
          fill="#121212"
          fontFamily="Georgia, serif"
          fontSize="9.5"
          fontWeight="700"
          letterSpacing="1.8"
        >
          BARGELLO
        </text>
        <text
          x="110"
          y="156"
          textAnchor="middle"
          fill="#8e6d31"
          fontFamily="Georgia, serif"
          fontSize="9"
          fontWeight="700"
          letterSpacing="1.2"
        >
          BODY MIST
        </text>
        <text
          x="110"
          y="194"
          textAnchor="middle"
          fill="#57534e"
          fontFamily="sans-serif"
          fontSize="8"
        >
          {product.volume_ml} ml
        </text>
      </svg>
    );
  }

  if (product.collection_type === 'car_home') {
    const isReed = product.volume_ml >= 50;
    return (
      <svg
        viewBox="0 0 220 280"
        style={{ width: '100%', maxHeight, height: 'auto', display: 'block' }}
        role="img"
        aria-label={product.name_fa}
      >
        <ellipse cx="110" cy="252" rx="50" ry="7" fill="rgba(18,18,18,0.1)" />
        {isReed ? (
          <>
            <line x1="92" y1="22" x2="108" y2="115" stroke="#3f3a34" strokeWidth="2.4" />
            <line x1="110" y1="18" x2="110" y2="115" stroke="#3f3a34" strokeWidth="2.4" />
            <line x1="128" y1="22" x2="112" y2="115" stroke="#3f3a34" strokeWidth="2.4" />
          </>
        ) : (
          <path
            d="M95 58 Q110 16 125 58"
            fill="none"
            stroke="#8b6b4a"
            strokeWidth="3"
          />
        )}
        <rect x="86" y="58" width="48" height="32" rx="4" fill="#6d4c33" />
        <rect
          x="66"
          y="90"
          width="88"
          height="156"
          rx="10"
          fill="#faf6ef"
          stroke="#d4ccc0"
          strokeWidth="1.6"
        />
        <rect
          x="72"
          y="128"
          width="76"
          height="112"
          rx="6"
          fill={accent}
          fillOpacity="0.45"
        />
        <rect x="78" y="122" width="64" height="82" fill="#ffffff" stroke="#e5dfd5" />
        <text
          x="110"
          y="148"
          textAnchor="middle"
          fill="#121212"
          fontFamily="Georgia, serif"
          fontSize="9"
          fontWeight="700"
          letterSpacing="1.6"
        >
          BARGELLO
        </text>
        <text
          x="110"
          y="170"
          textAnchor="middle"
          fill="#57534e"
          fontFamily="sans-serif"
          fontSize="7.5"
          letterSpacing="1.2"
        >
          {isReed ? 'AMBIENT' : 'CAR PERFUME'}
        </text>
        <text
          x="110"
          y="191"
          textAnchor="middle"
          fill="#78716c"
          fontFamily="sans-serif"
          fontSize="7.5"
        >
          {product.volume_ml} ml
        </text>
      </svg>
    );
  }

  // Classic Bargello 50ml Coded EDP & Mystiq/Harmony Flacon
  const codeText =
    product.code ||
    (product.collection_type === 'mystiq' ? 'MYSTIQ' : 'EDP');

  return (
    <svg
      viewBox="0 0 220 280"
      style={{ width: '100%', maxHeight, height: 'auto', display: 'block' }}
      role="img"
      aria-label={product.name_fa}
    >
      <defs>
        <linearGradient id={`juice-${codeText}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6ebd4" stopOpacity="0.65" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id="capObsidian" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0d0d0d" />
          <stop offset="38%" stopColor="#343434" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>
      </defs>

      <ellipse cx="110" cy="257" rx="58" ry="7.5" fill="rgba(18,18,18,0.10)" />
      <rect x="85" y="22" width="50" height="46" rx="2.5" fill="url(#capObsidian)" />
      <rect x="93" y="68" width="34" height="10" fill="#d4d4d8" />

      <rect
        x="58"
        y="78"
        width="104"
        height="174"
        rx="5"
        fill="#ffffff"
        stroke="#d6d1c7"
        strokeWidth="1.6"
      />
      <rect
        x="65"
        y="88"
        width="90"
        height="148"
        rx="3"
        fill={`url(#juice-${codeText})`}
      />
      <line
        x1="110"
        y1="78"
        x2="110"
        y2="233"
        stroke="rgba(120,113,108,0.28)"
        strokeWidth="1.4"
      />
      <rect x="59" y="236" width="102" height="15" rx="2" fill="rgba(235,230,222,0.75)" />

      <rect
        x="73"
        y="108"
        width="74"
        height="106"
        fill="#ffffff"
        stroke="#e7e2d8"
        strokeWidth="1"
      />
      <rect x="73" y="108" width="74" height="4.5" fill="#121212" />

      <text
        x="110"
        y="131"
        textAnchor="middle"
        fill="#121212"
        fontFamily="Georgia, serif"
        fontSize="10.2"
        fontWeight="700"
        letterSpacing="2"
      >
        BARGELLO
      </text>

      <text
        x="110"
        y="162"
        textAnchor="middle"
        fill="#121212"
        fontFamily="Georgia, serif"
        fontSize={codeText.length > 4 ? '12.5' : '22'}
        fontWeight="700"
        letterSpacing="1.5"
      >
        {codeText}
      </text>

      <text
        x="110"
        y="179"
        textAnchor="middle"
        fill="#8e6d31"
        fontFamily="sans-serif"
        fontSize="7.2"
        fontWeight="700"
        letterSpacing="1.8"
      >
        {product.scent_family.toUpperCase()}
      </text>

      <text
        x="110"
        y="194"
        textAnchor="middle"
        fill="#57534e"
        fontFamily="sans-serif"
        fontSize="6.5"
        letterSpacing="1.2"
      >
        EAU DE PERFUME
      </text>

      <text
        x="110"
        y="206"
        textAnchor="middle"
        fill="#78716c"
        fontFamily="sans-serif"
        fontSize="7.2"
      >
        {product.volume_ml} ml
      </text>
    </svg>
  );
};
