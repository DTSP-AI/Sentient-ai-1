//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\(auth)\layout.tsx

const AuthLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="flex items-center justify-center h-full">
            {children}
        </div>
    );
}

export default AuthLayout;