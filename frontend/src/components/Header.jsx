import React from "react";


function Header(){

    return(

        <header className="bg-anime-card py-6 shadow-lg">
            <div className="container mx-auto px-4 text-center">

                <h1 className="text-4xl md:text-5xl font-display text-[#DD0426] tracking-wide uppercase">
                    Sensei Suggest
                </h1>
                
                <p className="mt-2 text-[1.4rem] text-[#AAAAAA] font-hand">Your personalised recommendation gateway</p>
            </div>    
            
        </header>
    )
}

export default Header;