import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { EnrichedTrain, StationStop } from '../../types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  train: EnrichedTrain;
  className?: string;
}

function MapBoundsController({ train }: { train: EnrichedTrain }) {
  const map = useMap();
  useEffect(() => {
    const allPoints: [number, number][] = [];
    [...(train.originalRoute || []), ...(train.approvedRoute || train.proposedRoute || [])].forEach(s => {
      allPoints.push([s.lat, s.lng]);
    });
    if (allPoints.length >= 2) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [40, 40], animate: false });
    } else if (allPoints.length === 1) {
      map.setView(allPoints[0], 10);
    }
  }, [train, map]);
  return null;
}

function routeToLatLng(route: StationStop[]): [number, number][] {
  return route.map(s => [s.lat, s.lng]);
}

function getAffectedSegmentIndices(route: StationStop[], affectedSection: string | null): number[] {
  if (!affectedSection) return [];
  const parts = affectedSection.split('\u2192').map(s => s.trim());
  if (parts.length < 2) return [];
  const fromCode = parts[0];
  const toCode = parts[1];
  const indices: number[] = [];
  route.forEach((s, i) => {
    if (s.code === fromCode || s.code === toCode) indices.push(i);
  });
  if (indices.length >= 2) return indices;
  route.forEach((s, i) => {
    if (s.station.includes(fromCode) || s.station.includes(toCode)) {
      if (!indices.includes(i)) indices.push(i);
    }
  });
  return indices;
}

export default function TrainRouteMap({ train, className }: Props) {
  const center: [number, number] = [
    train.originalRoute[0]?.lat ?? 18.5,
    train.originalRoute[0]?.lng ?? 74.0,
  ];

  const originalCoords = routeToLatLng(train.originalRoute);
  const proposedCoords = train.proposedRoute ? routeToLatLng(train.proposedRoute) : [];
  const approvedCoords = train.approvedRoute ? routeToLatLng(train.approvedRoute) : [];

  const affectedIdx = getAffectedSegmentIndices(train.originalRoute, train.affectedSection);
  let blockedSegment: [number, number][] = [];
  if (affectedIdx.length >= 2) {
    const sorted = affectedIdx.sort((a, b) => a - b);
    blockedSegment = train.originalRoute.slice(sorted[0], sorted[sorted.length - 1] + 1).map(s => [s.lat, s.lng]);
  }

  const activeRoute = approvedCoords.length > 0 ? approvedCoords : proposedCoords;
  const isApproved = approvedCoords.length > 0;
  const hasReroute = activeRoute.length > 0;

  return (
    <div className={className} style={{ position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        />
        <MapBoundsController train={train} />

        {originalCoords.length >= 2 && (
          <Polyline positions={originalCoords} pathOptions={{ color: '#9ca3af', weight: 4, opacity: 0.8 }} />
        )}

        {blockedSegment.length >= 2 && (
          <Polyline positions={blockedSegment} pathOptions={{ color: '#ef4444', weight: 5, dashArray: '8,6', opacity: 0.95 }} />
        )}

        {!isApproved && proposedCoords.length >= 2 && (
          <Polyline positions={proposedCoords} pathOptions={{ color: '#2563eb', weight: 4, dashArray: '10,5', opacity: 0.9 }} />
        )}

        {isApproved && approvedCoords.length >= 2 && (
          <Polyline positions={approvedCoords} pathOptions={{ color: '#16a34a', weight: 5, opacity: 0.95 }} />
        )}

        {train.originalRoute.map((station, i) => {
          const isSource = i === 0;
          const isDest = i === train.originalRoute.length - 1;
          const isAffected = affectedIdx.includes(i);
          const color = isAffected && train.affectedSection ? '#ef4444' : isSource ? '#ea580c' : isDest ? '#7c3aed' : '#6b7280';
          return (
            <CircleMarker
              key={`orig-${station.code}-${i}`}
              center={[station.lat, station.lng]}
              radius={isSource || isDest ? 9 : 6}
              pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 1, weight: 2 }}
            >
              <Tooltip permanent={isSource || isDest} direction="top" offset={[0, -8]}>
                <div style={{ fontSize: 11, fontWeight: 600 }}>
                  <span style={{ fontFamily: 'monospace' }}>{station.code}</span> — {station.station}
                  {isSource && <span style={{ color: '#ea580c', marginLeft: 4 }}>(Origin)</span>}
                  {isDest && <span style={{ color: '#7c3aed', marginLeft: 4 }}>(Destination)</span>}
                  {isAffected && train.affectedSection && <span style={{ color: '#ef4444', marginLeft: 4 }}>⚠ Affected</span>}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {hasReroute && (train.approvedRoute || train.proposedRoute)!.map((station, i) => {
          const isOnOriginal = train.originalRoute.some(s => s.code === station.code);
          if (isOnOriginal) return null;
          const color = isApproved ? '#16a34a' : '#2563eb';
          return (
            <CircleMarker
              key={`reroute-${station.code}-${i}`}
              center={[station.lat, station.lng]}
              radius={6}
              pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 1, weight: 2 }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <div style={{ fontSize: 11, fontWeight: 600 }}>
                  <span style={{ fontFamily: 'monospace' }}>{station.code}</span> — {station.station}
                  <span style={{ color, marginLeft: 4 }}>{isApproved ? '(Approved)' : '(Proposed)'}</span>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 1000, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '10px 12px', pointerEvents: 'none', fontSize: 11 }}>
        <div style={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, fontSize: 10, marginBottom: 8 }}>Route Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 20, height: 3, background: '#9ca3af', borderRadius: 2 }} />
          <span style={{ color: '#374151' }}>Original Route</span>
        </div>
        {train.affectedSection && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 20, height: 3, background: 'repeating-linear-gradient(90deg,#ef4444 0,#ef4444 4px,transparent 4px,transparent 8px)', borderRadius: 2 }} />
            <span style={{ color: '#dc2626' }}>Disrupted Section</span>
          </div>
        )}
        {train.proposedRoute && !isApproved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 20, height: 3, background: 'repeating-linear-gradient(90deg,#2563eb 0,#2563eb 5px,transparent 5px,transparent 10px)', borderRadius: 2 }} />
            <span style={{ color: '#2563eb' }}>Proposed Reroute</span>
          </div>
        )}
        {isApproved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 20, height: 3, background: '#16a34a', borderRadius: 2 }} />
            <span style={{ color: '#16a34a' }}>Approved Route</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 6, borderTop: '1px solid #f3f4f6', marginTop: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ea580c', border: '1.5px solid white', boxShadow: '0 0 0 1px #d1d5db' }} />
          <span style={{ color: '#374151' }}>Origin</span>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c3aed', border: '1.5px solid white', boxShadow: '0 0 0 1px #d1d5db', marginLeft: 4 }} />
          <span style={{ color: '#374151' }}>Destination</span>
        </div>
      </div>
    </div>
  );
}
