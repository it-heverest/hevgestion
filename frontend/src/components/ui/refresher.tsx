import { Loader, RefreshCcwIcon } from 'lucide-react'
import React, { useState } from 'react'

interface RefresherProps {
    onClick: () => Promise<void> | void;
}

function Refresher({ onClick }: RefresherProps) {
    const [refresh, setRefresh] = useState(false)
    
    // const refreshPage = async () => {
    //     setRefresh(true)
    //     window.location.reload()
    // }


  return (
    <div>
      {" "}
      <div>
        <button className="px-3" onClick={onClick}>
          {refresh ? (
            <Loader className="h-7 w-7 mx-auto text-muted-foreground opacity-50 animate-spin" />
          ) : (
            <RefreshCcwIcon className="h-7 w-7 mx-auto text-muted-foreground opacity-50" />
          )}
        </button>
      </div>
    </div>
  );
}

export default Refresher