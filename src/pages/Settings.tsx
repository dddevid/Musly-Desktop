import React from "react";
import { Settings as SettingsIcon, Music } from "lucide-react";
import { useTranscoding } from "../contexts/TranscodingContext";
import { TranscodeBitrate, TranscodeFormat } from "../services/TranscodingService";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6b7280" }}>
      {children}
    </h2>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl mb-6" style={{ background: "#111", border: "1px solid #1f1f1f" }}>
      {children}
    </div>
  );
}

function Row({
  label,
  sublabel,
  children,
  border = true,
}: {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={border ? { borderBottom: "1px solid #1f1f1f" } : {}}
    >
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {sublabel && <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{sublabel}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: value ? "#FA243C" : "#333" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{ transform: value ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={String(value)}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm font-medium rounded-lg px-3 py-1.5 outline-none"
      style={{
        background: "#1f1f1f",
        color: "#fff",
        border: "1px solid #333",
        cursor: "pointer",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={String(o.value)}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

const bitrateOptions = TranscodeBitrate.options.map((b) => ({
  value: b,
  label: TranscodeBitrate.getLabel(b),
}));

const formatOptions = TranscodeFormat.options.map((f) => ({
  value: f,
  label: TranscodeFormat.getLabel(f),
}));

export default function Settings() {
  const tc = useTranscoding();

  const activeBitrate = tc.getCurrentBitrate();
  const activeFormat = tc.getCurrentFormat();

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ maxWidth: 680 }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(250,36,60,0.15)" }}
        >
          <SettingsIcon size={20} style={{ color: "#FA243C" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>App preferences and streaming quality</p>
        </div>
      </div>

      {/* Transcoding */}
      <SectionTitle>Streaming Quality</SectionTitle>
      <Card>
        {/* Enable transcoding */}
        <Row
          label="Enable Transcoding"
          sublabel="Convert audio to a different format or bitrate while streaming"
        >
          <Toggle value={tc.enabled} onChange={tc.setEnabled} />
        </Row>

        {/* Format */}
        <Row label="Format" sublabel="Audio codec for transcoded streams">
          <Select
            value={tc.format}
            options={formatOptions}
            onChange={tc.setFormat}
          />
        </Row>

        {/* Bitrate */}
        <Row
          label="Bitrate"
          sublabel="Maximum streaming bitrate"
          border={false}
        >
          <Select
            value={tc.bitrate}
            options={bitrateOptions}
            onChange={(v) => tc.setBitrate(parseInt(v, 10))}
          />
        </Row>
      </Card>

      {/* Status card */}
      {tc.enabled && (
        <>
          <SectionTitle>Active Settings</SectionTitle>
          <Card>
            {activeBitrate !== null && (
              <Row label="Effective Bitrate" border={activeFormat !== null}>
                <span className="text-sm font-semibold" style={{ color: "#FA243C" }}>
                  {activeBitrate} kbps
                </span>
              </Row>
            )}
            {activeFormat !== null && (
              <Row label="Effective Format" border={false}>
                <div className="flex items-center gap-2">
                  <Music size={14} style={{ color: "#FA243C" }} />
                  <span className="text-sm font-semibold" style={{ color: "#FA243C" }}>
                    {TranscodeFormat.getLabel(activeFormat)}
                  </span>
                </div>
              </Row>
            )}
            {activeBitrate === null && activeFormat === null && (
              <Row label="No transcoding active" sublabel="Server streams in original quality" border={false}>
                <span className="text-xs px-2 py-1 rounded" style={{ background: "#1f1f1f", color: "#6b7280" }}>
                  Original
                </span>
              </Row>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
