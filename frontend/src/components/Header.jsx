import React from "react";


function Header(){

    return(

        <header className="bg-anime-card py-6 shadow-lg">
            <div className="container mx-auto px-4 text-center">

                <h1 className="text-4xl md:text-5xl font-extrabold text-anime-accent tracking-wide uppercase">
                    Sensei Suggest
                </h1>
                
                <p className="mt-2 text-lg md:text-xl text-anime-text-dark ">Your persolnalised recommendation gateway </p>
            </div>    
            
        </header>
    )
}

export default Header;