import React from "react"

interface HeaderProps {
    title: string,
}

const Header: React.FC<HeaderProps> = ({
    title,
}) => {
    return (
        <header className="p-4 rounded shadow sticky top-0 z-50">
            <div className="">
                <h1 className="text-2xl font-bold text-white-800">{title}</h1>
            </div>
        </header>
    )
}

export default Header;