import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  DollarSign, FileText, AlertCircle, Calendar,
  Download, Eye, TrendingUp, User, Briefcase
} from 'lucide-react';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const fmt = (n: any) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Payroll: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [salaryInfo, setSalaryInfo] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeSlip, setActiveSlip] = useState<any>(null);
  const [editCtcModal, setEditCtcModal] = useState<{show: boolean, emp: any}>({show: false, emp: null});
  const [newCtc, setNewCtc] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchInitialData();
  }, [user, isAdmin]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const slipsRes = await api.getPayslips();
      if (slipsRes.success) setPayslips(slipsRes.data || []);

      if (isAdmin || user?.role === 'manager') {
        const empRes = await api.getEmployees();
        if (empRes.success) setEmployees(empRes.data || []);
      } else {
        const salaryRes = await api.getMySalary();
        if (salaryRes.success) setSalaryInfo(salaryRes.data);
      }
    } catch (e) {
      console.error('Payroll fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSetCtc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCtcModal.emp || !newCtc) return;
    try {
      const res = await api.setEmployeeCTC(editCtcModal.emp.id, parseFloat(newCtc));
      if (res.success) {
        setMessage({ text: `CTC configured for ${editCtcModal.emp.name}.`, type: 'success' });
        setNewCtc('');
        setEditCtcModal({show: false, emp: null});
        fetchInitialData();
      } else {
        setMessage({ text: res.message || 'Failed to update CTC', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Error occurred', type: 'error' });
    }
  };

  const openEditCtc = (emp: any) => {
    setEditCtcModal({show: true, emp});
    setNewCtc(emp.ctc?.toString() || '');
  };

  const handlePrint = () => {
    if (!activeSlip) return;
    const printEl = document.getElementById('payslip-printable');
    if (!printEl) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      alert('Please enable popups to allow PDF downloads.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip_${activeSlip.employee_name || 'Employee'}_${activeSlip.month}_${activeSlip.year}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            body { 
              background-color: #ffffff !important; 
              color: #000000 !important; 
              padding: 40px; 
              font-family: 'Inter', sans-serif;
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
            .payslip-header { border-bottom: 2px solid #000; margin-bottom: 30px; padding-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: 800; color: #003366; }
            .section-title { background: #f0f4f8; padding: 10px 15px; font-weight: 700; font-size: 14px; margin: 20px 0 10px 0; border-left: 4px solid #003366; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
            .info-item { display: flex; justify-content: space-between; border-bottom: 1px dashed #ddd; padding-bottom: 5px; }
            .info-label { font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase; }
            .info-value { font-size: 12px; font-weight: 700; }
            .salary-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .salary-table th { background: #003366; color: #fff; padding: 12px 15px; text-align: left; font-size: 12px; }
            .salary-table td { padding: 10px 15px; border-bottom: 1px solid #eee; font-size: 12px; }
            .salary-table tr:last-child td { border-bottom: 2px solid #003366; font-weight: 800; background: #f8fafc; }
            .total-row { background: #f0f4f8; font-weight: 800; }
            .net-pay-box { background: #003366; color: #fff; padding: 20px; border-radius: 8px; margin-top: 30px; display: flex; justify-content: space-between; align-items: center; }
            .net-pay-label { font-size: 14px; font-weight: 600; }
            .net-pay-value { font-size: 24px; font-weight: 800; }
            @media print { 
              body { padding: 0; margin: 0; } 
              .no-print { display: none !important; } 
              @page { size: auto; margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 850px; margin: 0 auto;">
            ${printEl.innerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => { 
                window.print(); 
                // We don't close immediately to let the print dialog finish
              }, 1000);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="premium-spinner" />
      </div>
    );
  }

  return (
    <div className="container-fluid fade-in px-0">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12">
          <h1 className="display-5 fw-800 text-white mb-2">Payroll & Compensation</h1>
          <p className="text-secondary fw-500 mb-0">
            {isAdmin ? 'Manage employee salary structures and audit statements' : 'Your monthly earnings and historical payslips'}
          </p>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} fade-in mb-5 no-print`}>
          <div className="d-flex align-items-center gap-3">
            {message.type === 'success' ? <TrendingUp size={24} className="text-success" /> : <AlertCircle size={24} className="text-danger" />}
            <div className="flex-grow-1">
              <div className="fw-700 text-white small uppercase letter-spacing-1">{message.type === 'success' ? 'Operation Successful' : 'Error Occurred'}</div>
              <div className="text-dimmed small">{message.text}</div>
            </div>
            <button className="btn-close btn-close-white m-0" onClick={() => setMessage(null)} />
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* ── ADMIN: Employee CTC Directory ── */}
        {isAdmin && (
          <div className="col-12 no-print">
            <div className="premium-card">
              <div className="premium-card-header bg-transparent border-bottom border-secondary border-opacity-10 py-4 d-flex justify-content-between align-items-center">
                <h5 className="text-white fw-800 mb-0 d-flex align-items-center gap-2">
                  <DollarSign size={20} className="text-cyan" />
                  Employee CTC Directory
                </h5>
                <span className="badge-premium badge-premium-cyan">{employees.length} TOTAL</span>
              </div>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr className="border-bottom border-secondary border-opacity-10">
                      <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1">Employee</th>
                      <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1">Position & Dept</th>
                      <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-end">Annual CTC</th>
                      <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-center">Status</th>
                      <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.filter(e => e.role !== 'admin').map(emp => (
                      <tr key={emp.id} className="border-bottom border-secondary border-opacity-05">
                        <td className="px-4 py-4">
                          <div className="d-flex align-items-center gap-3">
                            <div className="user-avatar-sm" style={{ width: 42, height: 42, fontSize: '1rem' }}>
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-white fw-700 small">{emp.name}</div>
                              <div className="text-dimmed x-small">{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-white small fw-600">{emp.position || 'N/A'}</div>
                          <div className="text-dimmed x-small">{emp.department || 'General'}</div>
                        </td>
                        <td className="px-4 py-4 text-end">
                          <div className="text-white fw-800 h6 mb-0 font-monospace">{fmt(emp.ctc || 0)}</div>
                          <div className="text-dimmed x-small">Monthly: {fmt((emp.ctc || 0) / 12)}</div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`badge-premium ${emp.ctc ? 'badge-premium-success' : 'badge-premium-warning'}`}>
                            {emp.ctc ? 'CONFIGURED' : 'PENDING'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-end">
                          <button 
                            onClick={() => openEditCtc(emp)}
                            className="btn btn-premium-cyan btn-sm px-4 py-2"
                          >
                            Update Package
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── EMPLOYEE: My Earnings ── */}
        {!isAdmin && (
          <div className="col-12 no-print">
            {salaryInfo && salaryInfo.ctc > 0 ? (
              <div className="row g-4 mb-2">
                {[
                  { label: 'Annual CTC', value: fmt(salaryInfo.ctc), icon: <DollarSign size={24} />, color: 'var(--accent-cyan)' },
                  { label: 'Monthly Gross', value: fmt(salaryInfo.ctc / 12), icon: <TrendingUp size={24} />, color: 'var(--success)' },
                  { label: 'Basic Salary', value: fmt(salaryInfo.basic / 12), icon: <Briefcase size={24} />, color: '#fff' },
                  { label: 'HRA Benefit', value: fmt(salaryInfo.hra / 12), icon: <FileText size={24} />, color: '#fff' },
                ].map((card, idx) => (
                  <div key={card.label} className="col-md-6 col-xl-3">
                    <div className="premium-stat-card fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="premium-stat-icon" style={{ color: card.color, background: `${card.color}15`, borderColor: `${card.color}30` }}>
                        {card.icon}
                      </div>
                      <div className="premium-stat-number" style={{ fontSize: '1.75rem' }}>{card.value}</div>
                      <div className="premium-stat-label">{card.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="premium-card p-5 text-center fade-in">
                <AlertCircle size={64} className="text-warning mb-4 opacity-50" />
                <h4 className="text-white fw-800">Earnings Not Available</h4>
                <p className="text-dimmed mb-0 mx-auto" style={{ maxWidth: 400 }}>Your compensation structure is currently being finalized by HR. Please check back shortly.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Payslip Explorer ── */}
        {!isAdmin && (
          <div className="col-12">
            <div className="premium-card fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="premium-card-header bg-transparent p-4 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
                <h5 className="text-white fw-800 mb-0 d-flex align-items-center gap-2">
                  <Calendar size={20} className="text-cyan" />
                  Historical Payslips
                </h5>
                <span className="badge-premium badge-premium-indigo">{payslips.length} RECORDS</span>
              </div>

              {payslips.length === 0 ? (
                <div className="premium-card-body text-center py-5">
                  <div className="mb-4">
                    <FileText size={56} className="text-dimmed opacity-10" />
                  </div>
                  <h5 className="text-white fw-700">No Payslips Found</h5>
                  <p className="text-dimmed small mb-0">Monthly statements will appear here after payroll processing.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0">
                    <thead>
                      <tr className="border-bottom border-secondary border-opacity-10">
                        <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1">Pay Period</th>
                        <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-end">Gross Pay</th>
                        <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-end">Deductions</th>
                        <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-end">Net Salary</th>
                        <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payslips.map((slip: any) => (
                        <tr key={slip.id} className="border-bottom border-secondary border-opacity-05">
                          <td className="px-4 py-4">
                            <div className="d-flex align-items-center gap-3">
                              <div className="p-2 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--accent-cyan)' }}>
                                <Calendar size={18} />
                              </div>
                              <div className="text-white fw-800 small text-uppercase">
                                {MONTH_NAMES[parseInt(slip.month)]} {slip.year}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-end">
                            <span className="text-secondary small font-monospace">{fmt(slip.monthly_gross)}</span>
                          </td>
                          <td className="px-4 py-4 text-end">
                            <span className="text-danger small font-monospace">-{fmt(slip.total_deductions || slip.lop_deduction)}</span>
                          </td>
                          <td className="px-4 py-4 text-end">
                            <span className="text-cyan fw-900 h6 mb-0 font-monospace">{fmt(slip.net_salary)}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => setActiveSlip(slip)}
                              className="btn btn-premium-secondary btn-sm px-4 py-2 d-flex align-items-center gap-2 mx-auto"
                            >
                              <Eye size={14} /> View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Payslip Detailed Modal ── */}
      {activeSlip && (
        <div className="modal d-block no-print" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: '28px' }}>
              <div className="modal-header border-bottom border-secondary border-opacity-10 p-4 flex-wrap gap-3 align-items-center" style={{ background: 'var(--midnight-elevated)' }}>
                <h5 className="modal-title text-white fw-800 d-flex align-items-center gap-3 me-3">
                  <div className="p-2 rounded-3 bg-cyan bg-opacity-10 text-cyan">
                    <FileText size={20} />
                  </div>
                  Earnings Statement: {MONTH_NAMES[parseInt(activeSlip.month)]} {activeSlip.year}
                </h5>
                <div className="d-flex align-items-center gap-3 ms-auto">
                  <button onClick={handlePrint} className="btn btn-premium-cyan">
                    <Download size={18} className="me-2" /> Download Statement
                  </button>
                  <button onClick={() => setActiveSlip(null)} className="btn-close btn-close-white m-0" />
                </div>
              </div>

              <div className="modal-body p-0" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <style>{`
                  .payslip-screen-view { color: #000; font-family: 'Inter', sans-serif; }
                  .payslip-screen-view .payslip-header { border-bottom: 2px solid #000; margin-bottom: 30px; padding-bottom: 20px; }
                  .payslip-screen-view .company-name { font-size: 24px; font-weight: 800; color: #003366; }
                  .payslip-screen-view .section-title { background: #f0f4f8; padding: 10px 15px; font-weight: 700; font-size: 14px; margin: 20px 0 10px 0; border-left: 4px solid #003366; color: #000; }
                  .payslip-screen-view .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
                  .payslip-screen-view .info-item { display: flex; justify-content: space-between; border-bottom: 1px dashed #ddd; padding-bottom: 5px; }
                  .payslip-screen-view .info-label { font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase; }
                  .payslip-screen-view .info-value { font-size: 12px; font-weight: 700; color: #000; }
                  .payslip-screen-view .salary-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  .payslip-screen-view .salary-table th { background: #003366; color: #fff; padding: 12px 15px; text-align: left; font-size: 12px; }
                  .payslip-screen-view .salary-table td { padding: 10px 15px; border-bottom: 1px solid #eee; font-size: 12px; color: #000; }
                  .payslip-screen-view .salary-table tr:last-child td { border-bottom: 2px solid #003366; font-weight: 800; background: #f8fafc; }
                  .payslip-screen-view .total-row td { background: #f0f4f8; font-weight: 800; color: #000; }
                  .payslip-screen-view .net-pay-box { background: #003366; color: #fff; padding: 20px; border-radius: 8px; margin-top: 30px; display: flex; justify-content: space-between; align-items: center; }
                  .payslip-screen-view .net-pay-label { font-size: 14px; font-weight: 600; }
                  .payslip-screen-view .net-pay-value { font-size: 24px; font-weight: 800; }
                `}</style>
                <div id="payslip-printable" className="bg-white p-5 payslip-screen-view">
                  {/* Clean White Background for Printable Logic */}
                  <div className="payslip-header d-flex justify-content-between align-items-start">
                    <div>
                      <div className="company-name">WebAnatomy HRMS</div>
                      <div style={{ color: '#666', fontSize: '13px' }}>Enterprise Human Resource Management System</div>
                    </div>
                    <div className="text-end">
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#003366' }}>PAYSLIP</div>
                      <div style={{ fontWeight: '600' }}>{MONTH_NAMES[parseInt(activeSlip.month)]} {activeSlip.year}</div>
                    </div>
                  </div>

                  <div className="section-title">EMPLOYEE INFORMATION</div>
                  <div className="info-grid">
                    <div className="info-item"><span className="info-label">Employee Name</span><span className="info-value">{activeSlip.employee_name || user?.name}</span></div>
                    <div className="info-item"><span className="info-label">Annual CTC</span><span className="info-value">{fmt(activeSlip.ctc)}</span></div>
                    <div className="info-item"><span className="info-label">Department</span><span className="info-value">{activeSlip.department || 'N/A'}</span></div>
                    <div className="info-item"><span className="info-label">Position</span><span className="info-value">{activeSlip.position || 'N/A'}</span></div>
                  </div>

                  <div className="section-title">SALARY BREAKDOWN</div>
                  {(() => {
                    const basicMo = parseFloat(activeSlip.basic_monthly || 0);
                    const hraMo   = parseFloat(activeSlip.hra_monthly || 0);
                    const specMo  = parseFloat(activeSlip.special_allowance || 0);
                    const grossMo = parseFloat(activeSlip.monthly_gross || 0);
                    
                    const pfMo    = parseFloat(activeSlip.pf_deduction || 0);
                    const ptMo    = parseFloat(activeSlip.pt_deduction || 0);
                    const lopMo   = parseFloat(activeSlip.lop_deduction || 0);
                    const absMo   = parseFloat(activeSlip.absent_deduction || 0);
                    const lateMo  = parseFloat(activeSlip.late_deduction || 0);
                    const totalDed = pfMo + ptMo + lopMo + absMo + lateMo;

                    return (
                      <>
                        <table className="salary-table">
                          <thead>
                            <tr>
                              <th>EARNINGS DESCRIPTION</th>
                              <th className="text-end">MONTHLY COMPONENT</th>
                              <th className="text-end">ANNUAL PRO-RATA</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr><td>Basic Pay</td><td className="text-end">{fmt(basicMo)}</td><td className="text-end">{fmt(basicMo * 12)}</td></tr>
                            <tr><td>House Rent Allowance</td><td className="text-end">{fmt(hraMo)}</td><td className="text-end">{fmt(hraMo * 12)}</td></tr>
                            <tr><td>Special Allowance</td><td className="text-end">{fmt(specMo)}</td><td className="text-end">{fmt(specMo * 12)}</td></tr>
                            <tr className="total-row"><td>TOTAL GROSS EARNINGS</td><td className="text-end">{fmt(grossMo)}</td><td className="text-end">{fmt(grossMo * 12)}</td></tr>
                          </tbody>
                        </table>

                        <div className="section-title">DEDUCTIONS & ADJUSTMENTS</div>
                        <table className="salary-table">
                          <thead>
                            <tr>
                              <th>DEDUCTION DESCRIPTION</th>
                              <th className="text-end">ADJUSTMENT TYPE</th>
                              <th className="text-end">AMOUNT DEDUCTED</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr><td>Professional Tax (PT)</td><td className="text-end">Statutory</td><td className="text-end">{fmt(ptMo)}</td></tr>
                            {pfMo > 0 && <tr><td>Provident Fund (PF)</td><td className="text-end">Social Security</td><td className="text-end">{fmt(pfMo)}</td></tr>}
                            {lopMo > 0 && <tr><td>Loss of Pay (LOP)</td><td className="text-end">Attendance</td><td className="text-end">{fmt(lopMo)}</td></tr>}
                            {absMo > 0 && <tr><td>Absent Penalty</td><td className="text-end">Leave Policy</td><td className="text-end">{fmt(absMo)}</td></tr>}
                            {lateMo > 0 && <tr><td>Late Login Penalty</td><td className="text-end">Punctuality</td><td className="text-end">{fmt(lateMo)}</td></tr>}
                            <tr className="total-row"><td>TOTAL DEDUCTIONS</td><td colSpan={2} className="text-end" style={{ color: '#d32f2f' }}>{fmt(totalDed)}</td></tr>
                          </tbody>
                        </table>

                        <div className="net-pay-box">
                          <div className="net-pay-label">NET TAKE HOME SALARY</div>
                          <div className="net-pay-value">{fmt(activeSlip.net_salary)}</div>
                        </div>
                        
                        <div style={{ marginTop: '40px', fontSize: '10px', color: '#888', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                          * This is a computer generated document and does not require a signature.
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CTC Adjustment Modal ── */}
      {editCtcModal.show && (
        <div className="modal d-block no-print" style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '24px' }}>
              <div className="modal-header border-bottom border-secondary border-opacity-10 p-4">
                <h5 className="modal-title text-white fw-800 d-flex align-items-center gap-2">
                  <User size={20} className="text-cyan" />
                  Salary Configuration: {editCtcModal.emp?.name}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditCtcModal({show: false, emp: null})}></button>
              </div>
              <form onSubmit={handleSetCtc}>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <label className="text-dimmed small fw-700 uppercase letter-spacing-1 mb-3 d-block">Annual Package (INR)</label>
                    <div className="position-relative">
                      <span className="position-absolute text-secondary fw-bold" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }}>₹</span>
                      <input
                        type="number" min="0" step="1000"
                        className="form-control premium-input ps-5"
                        value={newCtc}
                        onChange={e => setNewCtc(e.target.value)}
                        placeholder="e.g. 650000"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {newCtc && (
                    <div className="p-4 rounded-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="text-cyan small fw-800 uppercase letter-spacing-1 mb-3">Live Pro-rata Breakdown</div>
                      {(() => {
                        const val = parseFloat(newCtc || '0');
                        const mGross = val / 12;
                        const mBasic = (val * 0.5) / 12;
                        return (
                          <div className="d-flex flex-column gap-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-dimmed small fw-600">Monthly Gross</span>
                              <span className="text-white fw-800">{fmt(mGross)}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-dimmed small fw-600">Basic Pay Component</span>
                              <span className="text-white fw-700">{fmt(mBasic)}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-dimmed small fw-600">Allowance Buffer</span>
                              <span className="text-white fw-700">{fmt(mGross - mBasic)}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top border-secondary border-opacity-10 p-4">
                  <button type="button" className="btn btn-premium-secondary" onClick={() => setEditCtcModal({show: false, emp: null})}>Cancel</button>
                  <button type="submit" className="btn btn-premium-cyan px-4">Update Compensation</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
