import type { WrappedStats } from "@/lib/wrapped";
import { messages as M } from "@/lib/messages";
import { t } from "@/lib/format";
import { Fragment } from "react/jsx-runtime";
import { cn } from "@/lib/cn";

function CardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
  name: string;
  rank: number;
}) {
  return (
    <section
      className={`flex min-h-full snap-start snap-always flex-col items-center justify-center px-6 ${className}`}
    >
      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-5 py-10 text-center">
        {children}
      </div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
      {children}
    </p>
  );
}

function BigStat({
  value,
  suffix,
  small = false,
}: {
  value: string;
  suffix?: string;
  small?: boolean;
}) {
  return (
    <p
      className={cn(
        "font-bold leading-none tracking-tight text-white",
        small ? "text-3xl" : "text-7xl",
      )}
    >
      {value}
      {suffix && (
        <span
          className={cn(
            "font-semibold text-white/50",
            small ? "text-xl" : "text-3xl",
          )}
        >
          {suffix}
        </span>
      )}
    </p>
  );
}

function RankGraph({
  history,
  playerCount,
  groupStageMatchCount,
}: {
  history: number[];
  playerCount: number;
  groupStageMatchCount: number;
}) {
  const W = 300;
  const H = 240;
  const padLeft = 28;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 28;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  const n = history.length;
  if (n === 0) return null;

  const maxX = n > 1 ? n - 1 : 1;
  const maxY = playerCount > 1 ? playerCount - 1 : 1;

  const px = (i: number) => padLeft + (i / maxX) * plotW;
  const py = (r: number) => padTop + ((r - 1) / maxY) * plotH;

  const areaPath =
    n > 1
      ? `M ${px(0)},${padTop + plotH} ` +
        history.map((r, i) => `L ${px(i)},${py(r)}`).join(" ") +
        ` L ${px(n - 1)},${padTop + plotH} Z`
      : "";

  const linePoints = history.map((r, i) => `${px(i)},${py(r)}`).join(" ");
  const bottomY = padTop + plotH;

  const ranks = Array.from(new Array(playerCount));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="rankArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <line
        x1={padLeft}
        y1={padTop}
        x2={padLeft}
        y2={bottomY}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1}
      />
      <line
        x1={W - padRight}
        y1={padTop}
        x2={W - padRight}
        y2={bottomY}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1}
      />
      <line
        x1={px(groupStageMatchCount)}
        y1={py(1)}
        x2={px(groupStageMatchCount)}
        y2={py(playerCount)}
        stroke="rgba(255,255,255,0.18)"
        strokeDasharray="2 3"
        strokeWidth={1}
      />
      {ranks.map((_, i) => {
        const rank = i + 1;

        const isEmphasized =
          rank % 3 === 0 || rank === 1 || rank === playerCount;

        return (
          <Fragment key={rank}>
            <line
              x1={padLeft}
              y1={py(rank)}
              x2={W - padRight}
              y2={py(rank)}
              stroke={
                isEmphasized
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(255,255,255,0.08)"
              }
              key={rank}
            />
            {isEmphasized ? (
              <text
                x={padLeft - 6}
                y={py(rank) + 3}
                textAnchor="end"
                className="fill-white/30 text-[12px]"
              >
                {rank}
              </text>
            ) : null}
          </Fragment>
        );
      })}
      <text
        x={px(groupStageMatchCount)}
        y={H - 12}
        textAnchor="middle"
        className="fill-white/30 text-[11px]"
      >
        {`Pudotuspelit ->`}
      </text>

      {n > 1 && <path d={areaPath} fill="url(#rankArea)" />}
      {n > 1 && (
        <polyline
          points={linePoints}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function WrappedView({
  name,
  stats,
}: {
  name: string;
  stats: WrappedStats;
}) {
  const {
    rank,
    playerCount,
    accuracy,
    draws,
    unanimous,
    nobodyCorrect,
    loneWolf,
    twin,
    nemesis,
    rankTrajectory,
    groupStageMatchCount,
    pickDistribution,
    oneGuessStrat,
  } = stats;

  return (
    <div className="flex min-h-0 flex-1 snap-y snap-mandatory flex-col overflow-y-auto overflow-x-hidden bg-zinc-950">
      <CardShell
        name={name}
        rank={rank}
        className="bg-linear-to-b from-primary-700 to-zinc-950 text-white"
      >
        <Eyebrow>{M.wrapped.hook.eyebrow}</Eyebrow>
        <p className="text-lg text-white/70">{M.wrapped.hook.title}</p>
        <BigStat value={`${rank}`} suffix={` / ${playerCount}`} />
      </CardShell>

      <CardShell
        name={name}
        rank={rank}
        className="bg-linear-to-b from-zinc-950 to-success-700 text-white"
      >
        <Eyebrow>{"Veikkausten jakauma"}</Eyebrow>
        <div className="flex flex-row w-full justify-evenly">
          <BigStat value={`${pickDistribution["1"]}`} suffix=" / 1" small />
          <BigStat value={`${pickDistribution["X"]}`} suffix=" / X" small />
          <BigStat value={`${pickDistribution["2"]}`} suffix=" / 2" small />
        </div>
        <p className="text-base text-white/70">
          Veikkauksesi jakaantuivat eri vaihtoehdoille näin.
        </p>
      </CardShell>
      <CardShell
        name={name}
        rank={rank}
        className="bg-linear-to-b from-success-700 to-zinc-950 text-white"
      >
        <Eyebrow>{M.wrapped.accuracy.eyebrow}</Eyebrow>
        <BigStat value={`${accuracy.pct}`} suffix="%" />
        <p className="text-base text-white/70">
          {t(M.wrapped.accuracy.detail).format({
            correct: accuracy.correct,
            total: accuracy.total,
          })}
        </p>
        <p className="text-base text-white/70">
          {oneGuessStrat &&
            t(M.wrapped.accuracy.betterStrategy).format(oneGuessStrat)}
        </p>
      </CardShell>

      <CardShell
        name={name}
        rank={rank}
        className="bg-linear-to-b from-zinc-950 to-accent-700 text-white"
      >
        <Eyebrow> {M.wrapped.draws.eyebrow}</Eyebrow>
        {/* <p className="max-w-[16rem] text-base text-white/70">
          {draws.pct > 50
            ? M.wrapped.draws.intro.good
            : M.wrapped.draws.intro.bad}
        </p> */}
        <BigStat
          value={`${draws.yourCorrect}`}
          suffix={`/${draws.tournamentCount}`}
        />

        <p className="text-base text-white/70">
          {t(M.wrapped.draws.detail).format({
            tournamentCount: draws.tournamentCount,
            pct: draws.pct,
          })}
        </p>
        {draws.leader && (
          <p className="text-sm text-white/50">
            {t(M.wrapped.draws.leader).format({
              name: draws.leader.names.join(", "),
              count: draws.leader.count,
              total: draws.tournamentCount,
            })}
          </p>
        )}
      </CardShell>

      <CardShell
        name={name}
        rank={rank}
        className="bg-linear-to-b from-accent-700 to-zinc-950 text-white"
      >
        <Eyebrow>{M.wrapped.unanimous.eyebrow}</Eyebrow>
        <BigStat value={`${unanimous.count}`} />
        <p className="max-w-[16rem] text-base text-white/70">
          {t(M.wrapped.unanimous.detail).format({ count: unanimous.correct })}
        </p>
        {unanimous.correct > 0 && (
          <p className="text-base font-semibold text-white/70">
            {t(M.wrapped.unanimous.correct).format({
              count: unanimous.correct,
            })}
          </p>
        )}
      </CardShell>

      <CardShell
        name={name}
        rank={rank}
        className="bg-linear-to-b from-zinc-950 to-danger-700 text-white"
      >
        <Eyebrow>{M.wrapped.nobodyCorrect.eyebrow}</Eyebrow>
        {nobodyCorrect.matches.length === 0 ? (
          <p className="max-w-[16rem] text-base text-white/70">
            {M.wrapped.nobodyCorrect.empty}
          </p>
        ) : (
          <>
            <BigStat value={`${nobodyCorrect.matches.length}`} />
            <p className="max-w-[16rem] text-base text-white/70">
              {t(M.wrapped.nobodyCorrect.detail).format({
                count: nobodyCorrect.matches.length,
              })}
            </p>
            <div
              className={`max-h-40 gap-1.5 overflow-y-auto ${
                nobodyCorrect.matches.length >= 4
                  ? "grid grid-cols-2"
                  : "flex flex-col"
              }`}
            >
              {nobodyCorrect.matches.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/70"
                >
                  <span className="tabular-nums">
                    {m.homeCode} – {m.awayCode}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardShell>

      <CardShell
        name={name}
        rank={rank}
        className="bg-linear-to-b from-danger-700 to-zinc-950  text-white"
      >
        <Eyebrow>{M.wrapped.loneWolf.eyebrow}</Eyebrow>
        <BigStat value={`${loneWolf.correctMatches.length}`} />
        <p className="max-w-[16rem] text-base text-white/70">
          {loneWolf.correctMatches.length === 0
            ? M.wrapped.loneWolf.zero
            : t(M.wrapped.loneWolf.some).format({
                count: loneWolf.correctMatches.length,
              })}
        </p>
        {loneWolf.leader && (
          <p className="text-sm text-white/50">
            {t(M.wrapped.loneWolf.leader).format({
              name: loneWolf.leader.names.join(", "),
              count: loneWolf.leader.count,
            })}
          </p>
        )}
        <div
          className={`max-h-40 gap-1.5 overflow-y-auto ${
            loneWolf.correctMatches.length >= 4
              ? "grid grid-cols-2"
              : "flex flex-col"
          }`}
        >
          {loneWolf.correctMatches.map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/70"
            >
              <span className="tabular-nums">
                {m.homeCode} – {m.awayCode}
              </span>
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell
        name={name}
        rank={rank}
        className="bg-linear-to-b from-zinc-950 to-warning-600 text-white"
      >
        <Eyebrow>{M.wrapped.twinNemesis.eyebrow}</Eyebrow>
        {twin ? (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-white/70">
              {M.wrapped.twinNemesis.twin}
            </p>
            <p className="text-2xl font-bold text-white">{twin.name}</p>
            <p className="text-lg text-white/70">{twin.agreement}%</p>
          </div>
        ) : (
          <p className="text-base text-white/60">
            {M.wrapped.twinNemesis.noData}
          </p>
        )}
        {nemesis && (
          <div className="mt-3 flex flex-col items-center gap-1">
            <p className="text-sm text-white/70">
              {M.wrapped.twinNemesis.nemesis}
            </p>
            <p className="text-2xl font-bold text-white">{nemesis.name}</p>
            <p className="text-lg text-white/70">{nemesis.agreement}%</p>
          </div>
        )}
      </CardShell>

      <CardShell
        name={name}
        rank={rank}
        className="bg-linear-to-b from-warning-600 to-zinc-950 text-white"
      >
        <Eyebrow>{M.wrapped.trajectory.eyebrow}</Eyebrow>
        <RankGraph
          history={rankTrajectory.history}
          playerCount={playerCount}
          groupStageMatchCount={groupStageMatchCount}
        />
        <div className="flex items-center justify-center gap-6 text-sm">
          <span className="text-white/70">
            {M.wrapped.trajectory.peak} {rankTrajectory.peak}.
          </span>
          <span className="text-white/70">
            {M.wrapped.trajectory.lowest} {rankTrajectory.lowest}.
          </span>
        </div>
        {/* <p className="max-w-[16rem] text-base text-white/70">
          {M.wrapped.trajectory.comment[rankTrajectory.label]}
        </p> */}
      </CardShell>

      <CardShell
        name={name}
        rank={rank}
        className="bg-linear-to-b from-zinc-950 to-primary-700 text-white"
      >
        <Eyebrow>Loppukaneetti</Eyebrow>
        <BigStat value="Kiitos pelaamisesta!" small></BigStat>
        {/* <p className="max-w-[16rem] text-base text-white/70">
          {M.wrapped.trajectory.comment[rankTrajectory.label]}
        </p> */}
        <p className="text-base text-white/70">
          Onneksi UEFA Euro 28 onkin jo ihan kulman takana... 👀
        </p>
      </CardShell>
    </div>
  );
}
