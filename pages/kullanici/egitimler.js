import { useEffect, useState } from "react";
import KullaniciLayout from "../../components/KullaniciLayout";
import SistemEgitim from "../SistemEgitim";

export default function EgitimlerPage() {
  const [userName, setUserName] = useState("Kullanıcı");
  const [trainings, setTrainings] = useState([]);

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName && savedName !== "undefined") setUserName(savedName);
  }, []);

  useEffect(() => {
    completeTrainingMission();
    async function fetchTrainings() {
      try {
        const userId = localStorage.getItem("userId");

const res = await fetch(
  `/api/organizasyon/trainings?role=kullanici&kullanici_id=${userId}`
);
        const json = await res.json();

        if (json.ok) {
          setTrainings(json.trainings || []);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchTrainings();
  }, []);

  async function completeTrainingMission() {
  const userId = localStorage.getItem("userId");

  if (!userId) return;

  await fetch("/api/kullanici/complete-action", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kullanici_id: userId,
      mission_key: "open_trainings",
    }),
  });
}

  return (
    <KullaniciLayout pageTitle="Eğitimlerim">
      <SistemEgitim
        isDark={true}
        userName={userName}
        activeTab="courses"
        trainings={trainings}
        onCompleteTraining={null}
      />
    </KullaniciLayout>
  );
}

async function completeTraining(training) {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Kullanıcı bilgisi bulunamadı.");
    return;
  }

  const res = await fetch("/api/certificates/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      template_key: "success_level",
      training_id: training?.id,
      training_name: training?.training_title || training?.title || "Eğitim",
      level: "ALTIN SEVİYE",
      score: "92/100",
    }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert("Sertifika oluşturulamadı: " + json.error);
    return;
  }

  alert("🎉 Sertifika başarıyla oluşturuldu.");
}