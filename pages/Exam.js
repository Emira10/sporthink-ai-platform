import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Quizlerim() {
  const [courses, setCourses] = useState([]);
  const [question, setQuestion] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [duration, setDuration] = useState('');
  const [score, setScore] = useState('');
  const [quizList, setQuizList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchQuizzes();
  }, []);

  async function fetchCourses() {
    const { data, error } = await supabase
      .from('egitim_katalogu')
      .select('egitim_id, baslik')
      .eq('aktif_mi', true);

    if (error) {
      console.error('Kurslar alınamadı:', error.message);
      return;
    }

    setCourses(data || []);
  }

  async function fetchQuizzes() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Quizler alınamadı:', error.message);
    } else {
      setQuizList(data || []);
    }

    setLoading(false);
  }

  async function handleCreateQuiz(e) {
    e.preventDefault();

    if (!question.trim()) {
      alert('Lütfen soru girin!');
      return;
    }

    if (!selectedCourse) {
      alert('Lütfen eğitim seçin!');
      return;
    }

    if (!duration || isNaN(Number(duration))) {
      alert('Lütfen geçerli bir süre girin!');
      return;
    }

    if (!score || isNaN(Number(score))) {
      alert('Lütfen geçerli bir puan girin!');
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([
          {
            course_id: Number(selectedCourse),
            question: question.trim(),
            duration: Number(duration),
            score: Number(score),
          },
        ])
        .select();

      if (error) {
        console.error('QUIZ EKLEME HATASI:', error);
        alert('Quiz eklenemedi: ' + error.message);
        return;
      }

      alert('Quiz başarıyla oluşturuldu!');

      setQuestion('');
      setSelectedCourse('');
      setDuration('');
      setScore('');

      setQuizList((prev) => [...data, ...prev]);
    } catch (err) {
      console.error('Beklenmeyen hata:', err);
      alert('Beklenmeyen bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-black mb-6">QUIZLERİM</h1>

      <form onSubmit={handleCreateQuiz} className="bg-white/5 rounded-2xl p-6 mb-8 space-y-4">
        <input
          type="text"
          placeholder="Soruyu girin"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
        />

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
        >
          <option value="">Eğitim seçin</option>
          {courses.map((course) => (
            <option key={course.egitim_id} value={course.egitim_id}>
              {course.baslik}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Süre"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            type="number"
            placeholder="Puan"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-red-700 text-white py-4 rounded-xl font-black"
        >
          {saving ? 'Kaydediliyor...' : 'QUIZ OLUŞTUR'}
        </button>
      </form>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : quizList.length === 0 ? (
        <p>Henüz quiz oluşturulmadı</p>
      ) : (
        <div className="space-y-4">
          {quizList.map((quiz) => (
            <div key={quiz.id} className="border rounded-xl p-4">
              <p><strong>Soru:</strong> {quiz.question}</p>
              <p><strong>Course ID:</strong> {quiz.course_id}</p>
              <p><strong>Süre:</strong> {quiz.duration}</p>
              <p><strong>Puan:</strong> {quiz.score}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}