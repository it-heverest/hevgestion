import { Loader, RefreshCcwIcon } from "lucide-react";
import React, { useState } from "react";

interface RefresherProps {
  onClick: () => Promise<void> | void;
}

function Refresher({ onClick }: RefresherProps) {
  const [refresh, setRefresh] = useState(false);

  const handleClick = async () => {
    try {
      setRefresh(true);
      await onClick();
    } catch (err) {
      // swallow — calling component handles errors; still stop spinner
      // eslint-disable-next-line no-console
      console.error("Refresher error:", err);
    } finally {
      setRefresh(false);
    }
  };

  return (
    <div>
      <div>
        <button className="px-3" onClick={handleClick}>
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

export default Refresher;
