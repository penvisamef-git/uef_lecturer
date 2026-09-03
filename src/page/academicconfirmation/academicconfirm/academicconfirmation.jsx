import React, { useState, useEffect, useRef } from 'react';
import { getByIdRequest } from '../../../util/request_api';
import SwalToast from '../../../component/SwalToast/SwalToast.js';
import Loading from '../../../component/Loading/Loading.component.jsx';
import RowBreaker from '../../../component/Boostramp/RowBreaker.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaDownload } from 'react-icons/fa';
import './AcademicConfirmation.css';

function AcademicConfirmation({ auth }) {
  // Hardcoded test ID
  const TEST_ID = '6a3b79c25f9676c25866c987';
  const contentRef = useRef(null);
  
  const swalToast = new SwalToast();
  const [isLoading, setIsLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [classData, setClassData] = useState(null);

  const api = `${process.env.REACT_APP_API_HOST}/api/admin/academic/class-get-all-class-by-id-user/${TEST_ID}`;
  const access_token = auth?.getClientLogin()?.data?.access_token;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const result = await getByIdRequest(api, access_token);
      
      if (result.success && result.data && result.data.length > 0) {
        const data = result.data[0];
        setClassData(data);
        
        if (data.students && data.students.length > 0) {
          const student = data.students.find(s => s.student_id._id === TEST_ID);
          if (student) {
            setStudentData(student.student_id);
          } else {
            setStudentData(data.students[0].student_id);
          }
        }
      } else {
        swalToast.toastError("មិនអាចទាញយកទិន្នន័យ!", 2000);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      swalToast.toastError("មានបញ្ហាក្នុងការទាញយកទិន្នន័យ!", 2000);
    } finally {
      setIsLoading(false);
    }
  }

  const getDegreeLabel = (level) => {
    const map = {
      certificate: "វិញ្ញាបនបត្រ",
      associate: "បរិញ្ញាបត្ររង",
      bachelor: "បរិញ្ញាបត្រ",
      master: "បរិញ្ញាបត្រជាន់ខ្ពស់",
      phd: "បណ្ឌិត",
      other: "ផ្សេងៗ"
    };
    return map[level] || level;
  };

  const getDegreeLabelEng = (level) => {
    const map = {
      certificate: "Certificate",
      associate: "Associate Degree",
      bachelor: "Bachelor Degree",
      master: "Master Degree",
      phd: "PhD / Doctorate",
      other: "Other"
    };
    return map[level] || level;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${toKhmerNumber(day)} ${getMonthName(month)} ${toKhmerNumber(year)}`;
  };

  const toKhmerNumber = (num) => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(num).replace(/\d/g, digit => khmerDigits[parseInt(digit)]);
  };

  const getMonthName = (month) => {
    const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 
                    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    return months[month - 1] || '';
  };

  const getMonthNameEng = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || '';
  };

  // Save as PDF - Fixed with better error handling
  const saveAsPDF = async () => {
    if (!contentRef.current) {
      swalToast.toastError("មិនអាចរកឃើញមាតិកា!", 2000);
      return;
    }
    
    try {
      setIsLoading(true);
      const element = contentRef.current;
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to capture with html2canvas
      let canvas;
      try {
        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: element.scrollWidth,
          height: element.scrollHeight
        });
      } catch (canvasError) {
        console.error('html2canvas error:', canvasError);
        // Fallback: try with simpler settings
        canvas = await html2canvas(element, {
          scale: 1.5,
          backgroundColor: '#ffffff',
          logging: false
        });
      }
      
      if (!canvas) {
        throw new Error('Failed to capture content');
      }
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`academic_confirmation_${TEST_ID}.pdf`);
      
      swalToast.toastSuccess("PDF បានរក្សាទុកដោយជោគជ័យ!", 2000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Show more specific error message
      const errorMsg = error.message || "មានបញ្ហាក្នុងការបង្កើត PDF!";
      swalToast.toastError(`មិនអាចបង្កើត PDF: ${errorMsg}`, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading is_loading={isLoading} />;
  }

  if (!studentData || !classData) {
    return (
      <div className="container defualt_White_Shadow_Theme" style={{ padding: '40px', textAlign: 'center' }}>
        <h4>មិនមានទិន្នន័យ</h4>
        <p>សូមពិនិត្យមើលការតភ្ជាប់ API</p>
        <button onClick={loadData} className="btn btn-primary">ផ្ទុកឡើងវិញ</button>
      </div>
    );
  }

  // Generate student name
  const fullName = `${studentData.lastname || ''} ${studentData.firstname || ''}`.trim();
  const fullNameEng = studentData.fullname_english || '';

  // Get gender
  const gender = studentData.gender === 'male' ? 'ប្រុស' : 'ស្រី';
  const genderEng = studentData.gender === 'male' ? 'Male' : 'Female';

  // Get nationality
  const nationality = studentData.nationality || 'ខ្មែរ';
  const nationalityEng = studentData.nationality || 'Cambodian';

  // Get place of birth
  const placeOfBirth = studentData.place_of_birth || 'N/A';

  // Get degree level
  const degreeLevel = classData.degree_level_id?.name || getDegreeLabel(studentData.degree_level);
  const degreeLevelEng = classData.degree_level_id?.name_in_eng || getDegreeLabelEng(studentData.degree_level);

  // Get major
  const majorName = classData.major_id?.name || studentData.major || 'N/A';
  const majorNameEng = classData.major_id?.name || 'N/A';

  // Get year study
  const yearStudy = classData.year_study_id?.name || 'N/A';
  const yearStudyEng = classData.year_study_id?.name_in_eng || 'N/A';

  // Get academic year - Khmer side with Khmer numbers
  const academicYearKhmer = `${toKhmerNumber(classData.year_study_from || '')} - ${toKhmerNumber(classData.year_study_to || '')}`;
  // Get academic year - English side with Arabic numbers
  const academicYearEng = `${classData.year_study_from || ''} - ${classData.year_study_to || ''}`;

  // Current date
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return (
    <div className="container defualt_White_Shadow_Theme" style={{ padding: '30px 40px' }}>
      <RowBreaker />
      
      {/* Content to be captured for PDF */}
      <div ref={contentRef} className="academic-confirmation-content" style={{ fontFamily: "'Khmer OS', 'Siemreap', sans-serif" }}>
        <div style={{ 
          padding: '20px',
          backgroundColor: '#ffffff'
        }}>
          <div className="row">
            <div className="col-md-2">
                <div style={{ fontFamily: "'Khmer OS Siemreap'", fontWeight: 'bold' }}>
                    លេខ:.................
                </div>
            </div>
            <div className="col-md-2">
            <div style={{ fontFamily: "'Khmer OS Siemreap'", fontWeight: 'bold' }}>
              សសហ
            </div>
            </div>
          </div>
         
          <RowBreaker />
          <RowBreaker />

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ 
              fontFamily: "'Moul', 'Khmer OS', serif", 
              fontWeight: 'bold', 
              fontSize: '24px',
              color: '#000'
            }}>
              លិខិតបញ្ជាក់ការសិក្សា
            </div>
            <div style={{ 
              fontFamily: "'Anton', sans-serif",
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#000',
              letterSpacing: '1px'
            }}>
              ACADEMIC CONFIRMATION
            </div>
          </div>

          {/* Content */}
            <div style={{ padding: '10px 0' }}>
              {/* Khmer Statement */}
              <div style={{ marginBottom: '20px' }}>
               <div className="row">
                <div className="col-md-6">
                <p style={{ 
                  margin: 0, 
                  fontSize: '22px', 
                  lineHeight: '2',
                  fontFamily: "'Khmer OS Siemreap'",
                }}>
                  <strong >សាកលវិទ្យាល័យសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ </strong> បញ្ជាក់ថាៈ
                </p>
                </div>
                <div className="col-md-6">
                    <p style={{ 
                  margin: 0, 
                  fontSize: '20px', 
                  lineHeight: '2',
                  fontFamily: "'Anton', sans-serif",
                  letterSpacing: '0.5px',
                }}>
                  <strong>University of Economics and Finance certifies that:</strong> 
                </p>
                </div>
               </div>
              </div>

              {/* Student Info - Khmer */}

              <div className="row">
                <div className="col-md-6">
                    <div className="row">
                    <div className="col-md-3" style={{marginBottom: '15px', fontFamily: "'Khmer OS Siemreap'"}}><span >ឈ្មោះ </span></div>
                    <div className="col-md-3"> : <span style={{ marginLeft: '8px',fontFamily: "'Moul', 'Khmer OS', serif",fontWeight: 'bold' }}>  {fullName}</span></div>
                    <div className="col-md-6">
                    <span style={{ marginLeft: '8px',fontFamily: "'Khmer OS Siemreap'" }}>ភេទ  ៖ </span>
                    <span style={{ marginLeft: '8px',fontFamily: "'Khmer OS Siemreap'", fontWeight: "bold"}}>  {gender} </span>
                    </div>  
                    </div>
                    
                </div>
                <div className="col-md-6">
                    <div className="row">
                      <div className="col-md-3" style={{marginBottom: '15px', fontFamily: "'Anton'"}}><span >Name </span></div>
                    <div className="col-md-3"> : <span style={{ marginLeft: '8px',fontFamily: "'Anton'",fontWeight: 'bold' }}> {fullNameEng || fullName}</span></div>
                    <div className="col-md-6">
                    <span style={{ marginLeft: '8px',fontFamily: "'Anton'" }}>Sex   </span>
                    : <span style={{ marginLeft: '8px',fontFamily: "Anton", fontWeight: "bold"}}>  {genderEng} </span>
                    </div>  
                    </div>
                    
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                    <div className="row">
                        <div className="col-md-3" style={{marginBottom: '15px', fontFamily: "'Khmer OS Siemreap'"}}>
                        <span >សញ្ជាតិ </span>
                        </div>
                        <div className="col-md-9">
                        : <span style={{ marginLeft: '8px',fontFamily: "'Khmer OS Siemreap'",fontWeight: 'bold' }}>  {nationality}</span>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="row">
                        <div className="col-md-3" style={{marginBottom: '15px', fontFamily: "'Anton'"}}>
                        <span >Nationality </span>
                        </div>
                        <div className="col-md-9">
                        : <span style={{ marginLeft: '8px',fontFamily: "'Anton'",fontWeight: 'bold' }}>  {nationalityEng} </span>
                    </div>
                    </div>
                </div>
              </div>



              <div className="row">
                <div className="col-md-6">
                    <div className="row">
                        <div className="col-md-3" style={{marginBottom: '15px', fontFamily: "'Khmer OS Siemreap'"}}>
                        <span >ថ្ងៃ ខែ ឆ្នាំកំណើត </span>
                        </div>
                        <div className="col-md-9">
                        : <span style={{ marginLeft: '8px',fontFamily: "'Khmer OS Siemreap'",fontWeight: 'bold' }}>  {studentData.dob ? formatDate(studentData.dob) : 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="row">
                        <div className="col-md-3" style={{marginBottom: '15px', fontFamily: "'Anton'"}}>
                        <span >Date of Birth </span>
                        </div>
                        <div className="col-md-9">
                        : <span style={{ marginLeft: '8px',fontFamily: "'Anton'",fontWeight: 'bold' }}>  
                            {studentData.dob ? new Date(studentData.dob).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        }) : 'N/A'}    
                         </span>
                    </div>
                    </div>
                </div>
              </div>


              <div className="row">
                <div className="col-md-6">
                    <div className="row">
                        <div className="col-md-3" style={{marginBottom: '15px', fontFamily: "'Khmer OS Siemreap'"}}>
                        <span >ទីកន្លែងកំណើត </span>
                        </div>
                        <div className="col-md-9">
                        : <span style={{ marginLeft: '8px',fontFamily: "'Khmer OS Siemreap'",fontWeight: 'bold' }}> {placeOfBirth} </span>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="row">
                        <div className="col-md-3" style={{marginBottom: '15px', fontFamily: "'Anton'"}}>
                        <span >Place of Birth </span>
                        </div>
                        <div className="col-md-9">
                        : <span style={{ marginLeft: '8px',fontFamily: "'Anton'",fontWeight: 'bold' }}>  
                            {placeOfBirth}
                         </span>
                    </div>
                    </div>
                </div>
              </div>



              <div className="row">
                <div className="col-md-6">
                <span style={{ fontFamily: "'Khmer OS Siemreap'" }}>កំពុងសិក្សាថ្នាក់{degreeLevel}</span>
                </div>
                <div className="col-md-6">
                    <span style={{ fontFamily: 'Anton' }}>Has been pursuing the {degreeLevelEng}.</span>
                </div>
              </div>
                 
                 <RowBreaker/>

              <div className="row">
                <div className="col-md-6">
                    <div className="row">
                        <div className="col-md-3" style={{marginBottom: '15px', fontFamily: "'Khmer OS Siemreap'"}}>
                        <span >ជំនាញ </span>
                        </div>
                        <div className="col-md-9">
                        : <span style={{ marginLeft: '8px',fontFamily: "'Khmer OS Siemreap'",fontWeight: 'bold' }}> {majorName} {yearStudy} </span>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="row">
                        <div className="col-md-3" style={{marginBottom: '15px', fontFamily: "'Anton'"}}>
                        <span >Majoring </span>
                        </div>
                        <div className="col-md-9">
                        : <span style={{ marginLeft: '8px',fontFamily: "'Anton'",fontWeight: 'bold' }}>  
                            {majorNameEng} {yearStudyEng}
                         </span>
                    </div>
                    </div>
                </div>
              </div>


              <div className="row">
                <div className="col-md-6">
                    <div className="row">
                        <div className="col-md-3" style={{marginBottom: '15px', fontFamily: "'Khmer OS Siemreap'"}}>
                        <span >ឆ្នាំសិក្សា </span>
                        </div>
                        <div className="col-md-9">
                        : <span style={{ marginLeft: '8px',fontFamily: "'Khmer OS Siemreap'",fontWeight: 'bold' }}> {academicYearKhmer} </span>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="row">
                        <div className="col-md-3" style={{marginBottom: '15px', fontFamily: "'Anton'"}}>
                        <span >Academic year </span>
                        </div>
                        <div className="col-md-9">
                        : <span style={{ marginLeft: '8px',fontFamily: "'Anton'",fontWeight: 'bold' }}>  
                            {academicYearEng}
                         </span>
                    </div>
                    </div>
                </div>
              </div>


              <div className="row">
                <div className="col-md-6">
                <div style={{ marginBottom: '20px' }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '15px', 
                  lineHeight: '2',
                  fontFamily: "'Khmer OS Siemreap'",
                }}>
                  លិខិតបញ្ជាក់ការសិក្សានេះចេញជូនសាមីខ្លួនប្រើប្រាស់ 
                  <br/>
                  ជាផ្លូវការតាមការដែលអាចប្រើបាន ។
                </p>
              </div>

                </div>
                <div className="col-md-6">
                <span style={{ marginLeft: '8px',fontFamily: "'Anton'" }}>  
                This letter of study is granted for offical use.
                </span>
                </div>
              </div>
               
              {/* Footer */}

                <div className="row">
                    <div className="col-md-12">
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px',
                      fontFamily: "'Khmer OS Siemreap'",
                      textAlign:"end",

                    }}>
                      ថ្ងៃ............................ ខែអស្សុជ ឆ្នាំឆ្លូវ ត្រីសំក ព.ស. {toKhmerNumber(2465)}
                    </p>
                    </div>
                </div>

                <RowBreaker/>

                <div className="row">
                    <div className="col-md-12">
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px',
                      fontFamily: "'Khmer OS Siemreap'",
                      textAlign:"end"
                    }}>
                      រាជធានីភ្នំពេញ ថ្ងៃទី {toKhmerNumber(currentDay)} ខែ{getMonthName(currentMonth)} ឆ្នាំ{toKhmerNumber(currentYear)}
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '12px', 
                      color: '#555',
                      fontFamily: "'Anton', sans-serif",
                      letterSpacing: '0.5px',
                      textAlign:"end"
                    }}>
                      Phnom Penh, {getMonthNameEng(currentMonth)} {currentDay}, {currentYear}
                    </p>
                    </div>
                </div>
            </div>
          
        </div>
      </div>
      
      <RowBreaker break={2} />

      {/* Download Button */}
      <div className="row" style={{ marginBottom: '20px' }}>
        <div className="col-md-12">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center' 
          }}>
            <button
              type="button"
              className="btn btn-success"
              onClick={saveAsPDF}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '8px',
                fontFamily: "'Khmer OS Siemreap'",
                fontWeight: '500',
                fontSize: '14px',
                backgroundColor: '#1a3c2a',
                borderColor: '#1a3c2a'
              }}
            >
              <FaDownload size={16} />
              ទាញយក
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcademicConfirmation;