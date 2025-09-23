// AyoGameOver.tsx
import React, { useEffect, useState } from "react";
import {RewardModal} from "@/src/components/RewardModal";

interface Props {
  result: "win" | "loss" | "draw";
  level?: number;
  mode: "computer" | "online";
  onRestart: () => void;
}

export default function AyoGameOver({ result, level = 1, mode, onRestart }: Props) {
  const [reward, setReward] = useState(0);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    let baseReward = 0;
    let bonus = 0;

    if (mode === "computer") {
      if (result === "win") baseReward = [10, 20, 30, 40, 50][level - 1];
      else if (result === "draw") baseReward = [10, 20, 30, 40, 50][level - 1] / 2;
      else baseReward = 0;
      bonus = 15;
    } else {
      if (result === "win") baseReward = 50;
      else if (result === "draw") baseReward = 0;
      else baseReward = -50;
      bonus = 25;
    }

    setReward(baseReward + bonus);
  }, [result, mode, level]);

  const handleClose = () => {
    setShowModal(false);
    onRestart();
  };

  return (
    <>
      {showModal && (
        <RewardModal
          result={result}
          reward={reward}
          onClose={handleClose}
        />
      )}
    </>
  );
}
