import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Nhitny Blog - AI, Deep Learning & Engineering'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0f172a', // slate-900
                    backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                }}
            >
                {/* Background Overlay for better text contrast */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.8), rgba(88, 28, 135, 0.4))', // Slate to Purple
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                    }}
                >
                    {/* Main Title */}
                    <div
                        style={{
                            fontSize: 96,
                            fontWeight: 900,
                            marginBottom: 20,
                            display: 'flex',
                            alignItems: 'center',
                            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            background: 'linear-gradient(to right, #ffffff, #a5b4fc)',
                            backgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Nhitny Blog
                    </div>

                    {/* Subtitle */}
                    <div
                        style={{
                            fontSize: 36,
                            fontWeight: 600,
                            color: '#e2e8f0', // slate-200
                            display: 'flex',
                            gap: '24px',
                            padding: '12px 32px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '50px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            marginTop: 10,
                        }}
                    >
                        <span>💡 AI</span>
                        <span>•</span>
                        <span>🚀 Deep Learning</span>
                        <span>•</span>
                        <span>🛠️ Engineering</span>
                    </div>
                </div>

                {/* Footer/Decoration */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 50,
                        fontSize: 24,
                        color: '#94a3b8', // slate-400
                        display: 'flex',
                        letterSpacing: '0.1em',
                        zIndex: 10,
                    }}
                >
                    NHITNY-BLOGS.VERCEL.APP
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
