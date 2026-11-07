import { useEffect, useState } from "react";

type Props = {
    size?: number; // px (width = height)
};

export function AnalogWallClock({ size = 220 }: Props) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;

    // Angles
    const secDeg = seconds * 6; // 360 / 60
    const minDeg = minutes * 6;
    const hourDeg = hours * 30;

    const sizeStyle: React.CSSProperties = { width: size, height: size };

    return (
        <div
            className="relative rounded-full bg-gray-100 border-8 border-gray-300 shadow-lg"
            style={sizeStyle}
            aria-label="Analog wall clock"
            role="img"
        >
            {/* Silver outer ring */}
            <div className="absolute inset-0 rounded-full ring-4 ring-gray-200 pointer-events-none" />

            {/* Hour markers */}
            {[...Array(12)].map((_, i) => (
                <div
                    key={`h${i}`}
                    className="absolute left-1/2 top-1/2 origin-center"
                    style={{ transform: `translate(-50%, -50%) rotate(${i * 30}deg)` }}
                >
                    <div className="h-[10%] w-[3px] bg-gray-400 rounded-md translate-y-[-90%]" />
                </div>
            ))}

            {/* Minute markers */}
            {[...Array(60)].map((_, i) =>
                i % 5 === 0 ? null : (
                    <div
                        key={`m${i}`}
                        className="absolute left-1/2 top-1/2 origin-center"
                        style={{ transform: `translate(-50%, -50%) rotate(${i * 6}deg)` }}
                    >
                        <div className="h-[6%] w-[1.5px] bg-gray-300 rounded-md translate-y-[-94%]" />
                    </div>
                )
            )}

            {/* Numbers 1–12 - Improved alignment and size */}
            {[...Array(12)].map((_, i) => {
                const angle = (i + 1) * 30; // position in degrees
                const radius = size / 2 - 30; // distance from center
                const x = radius * Math.sin((angle * Math.PI) / 180);
                const y = -radius * Math.cos((angle * Math.PI) / 180);

                return (
                    <div
                        key={`num${i}`}
                        className="absolute flex items-center justify-center text-gray-700 font-bold text-lg"
                        style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: "translate(-50%, -50%)",
                            width: 30,
                            height: 30,
                            fontSize: size / 16, // Responsive font size
                        }}
                    >
                        {i + 1}
                    </div>
                );
            })}

            {/* Hour hand */}
            <div
                className="absolute left-1/2 top-1/2 origin-bottom"
                style={{
                    height: size * 0.28,
                    width: 6,
                    transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
                }}
            >
                <div className="h-full w-full bg-gray-600 rounded-full" />
            </div>

            {/* Minute hand */}
            <div
                className="absolute left-1/2 top-1/2 origin-bottom"
                style={{
                    height: size * 0.36,
                    width: 4,
                    transform: `translate(-50%, -100%) rotate(${minDeg}deg)`,
                }}
            >
                <div className="h-full w-full bg-gray-500 rounded-full" />
            </div>

            {/* Second hand */}
            <div
                className="absolute left-1/2 top-1/2 origin-bottom"
                style={{
                    height: size * 0.42,
                    width: 2,
                    transform: `translate(-50%, -100%) rotate(${secDeg}deg)`,
                }}
            >
                <div className="h-full w-full bg-red-500 rounded-full" />
            </div>

            {/* Center cap */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-300 border-2 border-gray-400 shadow" />
        </div>
    );
}