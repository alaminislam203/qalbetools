'use client';

import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export default function ResumeAI() {
  const [personalInfo, setPersonalInfo] = useState({ name: '', email: '', phone: '', location: '' });
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateResume = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resume-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalInfo, experience, skills, jobDescription }),
      });
      const json = await res.json();
      if (json.status) {
        setResumeData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!resumeData) return;
    const doc = new jsPDF();
    const margin = 20;
    let y = 30;

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(personalInfo.name || "RESUME", margin, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}`, margin, y);
    
    // Summary
    y += 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PROFESSIONAL SUMMARY", margin, y);
    y += 7;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(resumeData.summary, 170);
    doc.text(summaryLines, margin, y);
    y += (summaryLines.length * 6) + 5;

    // Experience
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("EXPERIENCE", margin, y);
    y += 10;
    resumeData.experience.forEach((exp: any) => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${exp.role} at ${exp.company}`, margin, y);
        y += 5;
        doc.setFont("helvetica", "italic");
        doc.text(exp.duration, margin, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        const details = doc.splitTextToSize(exp.details, 170);
        doc.text(details, margin, y);
        y += (details.length * 6) + 8;
    });

    // Skills
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SKILLS", margin, y);
    y += 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(resumeData.skills.join(", "), margin, y);

    doc.save(`${personalInfo.name || 'resume'}_Syntactic.pdf`);
  };

  const downloadDOCX = async () => {
    if (!resumeData) return;

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: personalInfo.name || "RESUME", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: `${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}`, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "PROFESSIONAL SUMMARY", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: resumeData.summary }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "EXPERIENCE", heading: HeadingLevel.HEADING_2 }),
          ...resumeData.experience.flatMap((exp: any) => [
            new Paragraph({ children: [new TextRun({ text: `${exp.role} at ${exp.company}`, bold: true })] }),
            new Paragraph({ children: [new TextRun({ text: exp.duration, italics: true })] }),
            new Paragraph({ text: exp.details }),
            new Paragraph({ text: "" }),
          ]),
          new Paragraph({ text: "SKILLS", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: resumeData.skills.join(", ") }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${personalInfo.name || 'resume'}_Syntactic.docx`);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Side */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input 
                placeholder="Full Name" 
                className="bg-white/5 border border-white/10 p-3 rounded-xl focus:border-primary outline-none text-sm"
                value={personalInfo.name} onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})}
              />
              <input 
                placeholder="Email Address" 
                className="bg-white/5 border border-white/10 p-3 rounded-xl focus:border-primary outline-none text-sm"
                value={personalInfo.email} onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">work</span>
              Experience & Skills
            </h3>
            <textarea 
              placeholder="Paste your raw experience here... (e.g. 5 years at Google, fixed bugs...)" 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl h-32 focus:border-primary outline-none text-sm resize-none"
              value={experience} onChange={e => setExperience(e.target.value)}
            />
            <input 
              placeholder="Key Skills (comma separated)" 
              className="w-full mt-4 bg-white/5 border border-white/10 p-3 rounded-xl focus:border-primary outline-none text-sm"
              value={skills} onChange={e => setSkills(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            onClick={generateResume}
            className={`w-full bg-primary text-black font-black py-4 rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <span className="material-symbols-outlined">auto_fix_high</span>
            )}
            {loading ? 'AI IS THINKING...' : 'GENERATE AI RESUME'}
          </button>
        </div>

        {/* Preview Side */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[500px]">
          {resumeData ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h4 className="font-bold text-white/40 uppercase tracking-widest text-xs">AI Resume Preview</h4>
                <div className="flex gap-2">
                  <button onClick={downloadPDF} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-red-500">picture_as_pdf</span>
                    PDF
                  </button>
                  <button onClick={downloadDOCX} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-blue-500">description</span>
                    DOCX
                  </button>
                </div>
              </div>

              <div id="resume-content" className="space-y-6 font-serif">
                <div className="text-center">
                    <h2 className="text-3xl font-black">{personalInfo.name}</h2>
                    <p className="text-sm text-white/50">{personalInfo.email} | {personalInfo.phone}</p>
                </div>
                <div className="space-y-2">
                    <h5 className="font-bold text-primary border-b border-primary/20 pb-1">SUMMARY</h5>
                    <p className="text-sm leading-relaxed text-white/80">{resumeData.summary}</p>
                </div>
                <div className="space-y-3">
                    <h5 className="font-bold text-primary border-b border-primary/20 pb-1">EXPERIENCE</h5>
                    {resumeData.experience.map((exp: any, i: number) => (
                        <div key={i} className="text-sm">
                            <div className="flex justify-between font-bold">
                                <span>{exp.role} at {exp.company}</span>
                                <span className="text-white/40">{exp.duration}</span>
                            </div>
                            <p className="mt-1 text-white/70">{exp.details}</p>
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    <h5 className="font-bold text-primary border-b border-primary/20 pb-1">SKILLS</h5>
                    <p className="text-sm text-white/80">{resumeData.skills.join(", ")}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <span className="material-symbols-outlined text-6xl text-white/10 mb-4">description</span>
                <p className="text-white/30 text-sm italic">Input your details and click the AI button to generate your professional resume preview here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
