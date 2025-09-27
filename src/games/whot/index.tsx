import React from 'react';
import AyoBattleUI from "./battleground/AyoBattleGroundUI";
import AyoComputerUI from "./computer/AyoComputerUI";
import AyoOnlineUI from "./online/AyoOnlineUI";
import { useToast } from "@/src/hooks/useToast";

type AyoIndexProps = {
  mode: "computer" | "online" | "battle";
};

export default function AyoIndex({ mode }: AyoIndexProps) {
  const { toast } = useToast();

  // Example toast usage for demonstration
  React.useEffect(() => {
    if (mode === "battle") {
      toast({ title: "Welcome!", description: "Battle mode started", type: "info" });
    }
  }, [mode]);

  if (mode === "computer") return <AyoComputerUI toast={toast} />;
  if (mode === "online") return <AyoOnlineUI toast={toast} />;
  return <AyoBattleUI playerRank={1600} mStake={0} toast={toast} />;
}
