import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  DollarSign, FileText, AlertCircle, Calendar,
  Download, Eye, X, TrendingUp
} from 'lucide-react';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const fmt = (n: any) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Payroll: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [ctc, setCtc] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [salaryInfo, setSalaryInfo] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeSlip, setActiveSlip] = useState<any>(null);


  useEffect(() => {
    if (!user) return; // wait until auth is resolved
    fetchInitialData();
  }, [user, isAdmin]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Always fetch payslips
      const slipsRes = await api.getPayslips();
      if (slipsRes.success) setPayslips(slipsRes.data || []);

      if (isAdmin || user?.role === 'manager') {
        // Admin: load all employees for the CTC form
        const empRes = await api.getEmployees();
        if (empRes.success) setEmployees(empRes.data || []);
      } else {
        // Employee: load own salary structure
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
    if (!selectedEmp || !ctc) return;
    try {
      const res = await api.setEmployeeCTC(parseInt(selectedEmp), parseFloat(ctc));
      if (res.success) {
        setMessage({ text: 'CTC configured. Payslips from Jan 2026 have been auto-generated.', type: 'success' });
        setCtc('');
        setSelectedEmp('');
        const slipsRes = await api.getPayslips();
        if (slipsRes.success) setPayslips(slipsRes.data || []);
      } else {
        setMessage({ text: res.message || 'Failed to update CTC', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Error occurred', type: 'error' });
    }
  };

  const handlePrint = () => {
    if (!activeSlip) return;
    const printEl = document.getElementById('payslip-printable');
    if (!printEl) return;

    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (!printWindow) {
      alert('Please enable popups to allow PDF downloads.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip_${activeSlip.employee_name || 'Employee'}_${activeSlip.month}_${activeSlip.year}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body { background-color: #ffffff !important; color: #000000 !important; padding: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .table { border-collapse: collapse; }
            .table th, .table td { border: 1px solid #000000 !important; padding: 10px !important; }
            .font-monospace { font-family: monospace !important; }
            @media print { body { padding: 0; margin: 0; } }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto;">
            ${printEl.innerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => { window.print(); window.close(); }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setActiveSlip(null);
  };



  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-cyan" />
      </div>
    );
  }

  return (
    <div className="container-fluid fade-in">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #payslip-printable, #payslip-printable * { visibility: visible !important; }
          #payslip-printable {
            position: fixed; inset: 0; width: 100vw;
            background: #fff !important; color: #111 !important;
            padding: 32px; z-index: 9999;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 no-print">
        <div>
          <h1 className="display-6 fw-800 text-white mb-1">Payroll</h1>
          <p className="text-dimmed small m-0">
            {isAdmin ? 'Manage employee salary packages and view payslips' : 'View your monthly salary statements'}
          </p>
        </div>

      </div>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2 mb-4 no-print`}
          style={{ background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 12, color: message.type === 'success' ? '#22c55e' : '#ef4444' }}>
          {message.type === 'success' ? <TrendingUp size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
          <button className="btn-close btn-close-white ms-auto opacity-50" onClick={() => setMessage(null)} />
        </div>
      )}

      <div className="row g-4">
        {/* ── ADMIN: CTC Form ── */}
        {isAdmin && (
          <div className="col-md-6 mx-auto no-print">
            <div className="premium-card p-4" style={{ background: 'var(--midnight-card)' }}>
              <h5 className="text-white fw-700 mb-1 d-flex align-items-center gap-2">
                <DollarSign size={18} className="text-cyan" /> Configure CTC
              </h5>
              <p className="text-dimmed small mb-4">Set annual CTC — payslips from Jan 2026 will be auto-generated.</p>

              <form onSubmit={handleSetCtc}>
                <div className="mb-3">
                  <label className="text-dimmed small fw-600 mb-2 d-block">Select Employee</label>
                  <select
                    className="form-select text-white"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}
                    value={selectedEmp}
                    onChange={e => setSelectedEmp(e.target.value)}
                    required
                  >
                    <option value="" className="bg-dark">Choose employee…</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id} className="bg-dark">{emp.name} — {emp.department}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="text-dimmed small fw-600 mb-2 d-block">Annual CTC (INR)</label>
                  <div className="input-group">
                    <span className="input-group-text text-cyan fw-700"
                      style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRight: 'none', borderRadius: '10px 0 0 10px' }}>₹</span>
                    <input
                      type="number" min="0" step="1000"
                      className="form-control text-white"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.2)', borderLeft: 'none', borderRadius: '0 10px 10px 0' }}
                      value={ctc}
                      onChange={e => setCtc(e.target.value)}
                      placeholder="e.g. 600000"
                      required
                    />
                  </div>
                  {ctc && (
                    <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.1)' }}>
                      <p className="text-dimmed small mb-1 fw-600">Salary Breakdown Preview</p>
                      {(() => {
                        const ctcVal = parseFloat(ctc || '0');
                        const bMo = (ctcVal * 0.5) / 12;
                        const hMo = (ctcVal * 0.2) / 12;
                        const aMo = (ctcVal * 0.05) / 12;
                        const cMo = 1600;
                        const sMo = (ctcVal / 12) - (bMo + hMo + aMo + cMo);
                        return (
                          <>
                            <div className="d-flex justify-content-between small mb-1">
                              <span className="text-dimmed">Basic (50%)</span>
                              <span className="text-white">{fmt(bMo)}/mo</span>
                            </div>
                            <div className="d-flex justify-content-between small mb-1">
                              <span className="text-dimmed">HRA (20%)</span>
                              <span className="text-white">{fmt(hMo)}/mo</span>
                            </div>
                            <div className="d-flex justify-content-between small mb-1">
                              <span className="text-dimmed">Allowances (5%)</span>
                              <span className="text-white">{fmt(aMo)}/mo</span>
                            </div>
                            <div className="d-flex justify-content-between small mb-1">
                              <span className="text-dimmed">Conveyance</span>
                              <span className="text-white">{fmt(cMo)}/mo</span>
                            </div>
                            <div className="d-flex justify-content-between small">
                              <span className="text-dimmed">Special Allowance</span>
                              <span className="text-white">{fmt(sMo)}/mo</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-premium-primary w-100">
                  Set Salary & Generate Payslips
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── EMPLOYEE: Salary Structure ── */}
        {!isAdmin && (
          <div className="col-12 no-print">
            {salaryInfo && salaryInfo.ctc > 0 ? (
              <div className="row g-3 mb-2">
                {[
                  { label: 'Annual CTC', value: fmt(salaryInfo.ctc), color: 'text-cyan' },
                  { label: 'Monthly Gross', value: fmt(salaryInfo.ctc / 12), color: 'text-white' },
                  { label: 'Basic / mo', value: fmt(salaryInfo.basic / 12), color: 'text-white' },
                  { label: 'HRA / mo', value: fmt(salaryInfo.hra / 12), color: 'text-white' },
                ].map(card => (
                  <div key={card.label} className="col-6 col-md">
                    <div className="premium-card p-3 text-center" style={{ background: 'var(--midnight-card)' }}>
                      <p className="text-dimmed small mb-1">{card.label}</p>
                      <p className={`fw-800 mb-0 ${card.color}`}>{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert d-flex align-items-center gap-2 mb-4"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 12, color: '#fbbf24' }}>
                <AlertCircle size={18} />
                Your salary structure hasn't been configured yet. Please contact HR.
              </div>
            )}
          </div>
        )}

        {/* ── Payslip List ── */}
        {!isAdmin && (
          <div className="col-12">
            <div className="premium-card" style={{ background: 'var(--midnight-card)' }}>
              <div className="d-flex align-items-center justify-content-between p-4 pb-2">
                <h5 className="text-white fw-700 m-0 d-flex align-items-center gap-2">
                  <Calendar size={18} className="text-cyan" />
                  My Payslips
                </h5>
                <span className="badge rounded-pill px-3 py-2"
                  style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)', fontSize: 12 }}>
                  {payslips.length} records
                </span>
              </div>

              {payslips.length === 0 ? (
                <div className="text-center py-5">
                  <FileText size={40} className="text-dimmed mb-3" />
                  <p className="text-dimmed">No payslips available yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0">
                    <thead>
                      <tr style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <th className="px-4 text-dimmed fw-600 small">Pay Period</th>
                        <th className="px-4 text-dimmed fw-600 small text-end">Gross Pay</th>
                        <th className="px-4 text-dimmed fw-600 small text-end">Deductions</th>
                        <th className="px-4 text-dimmed fw-600 small text-end">Net Pay</th>
                        <th className="px-4 text-dimmed fw-600 small text-center no-print">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payslips.map((slip: any) => (
                        <tr key={slip.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                          <td className="px-4">
                            <p className="text-white fw-600 mb-0 small">{MONTH_NAMES[parseInt(slip.month)]} {slip.year}</p>
                          </td>
                          <td className="px-4 text-end">
                            <span className="text-white fw-600 small font-monospace">{fmt(slip.monthly_gross)}</span>
                          </td>
                          <td className="px-4 text-end">
                            <span className="small font-monospace" style={{ color: '#ef4444' }}>
                              {fmt(slip.total_deductions || slip.lop_deduction)}
                            </span>
                          </td>
                          <td className="px-4 text-end">
                            <span className="fw-800 font-monospace" style={{ color: 'var(--accent-cyan)' }}>{fmt(slip.net_salary)}</span>
                          </td>
                          <td className="px-4 text-center no-print">
                            <button
                              onClick={() => setActiveSlip(slip)}
                              className="btn btn-sm d-inline-flex align-items-center gap-1 px-3"
                              style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 8, fontSize: 12 }}
                            >
                              <Eye size={13} /> View
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

      {/* ── Payslip Modal ── */}
      {activeSlip && (
        <div
          className="no-print animate-fade-in"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1050, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' }}
        >
          <div style={{ width: '100%', maxWidth: 750, background: '#ffffff', borderRadius: 20, overflow: 'hidden', border: '1px solid #e0e0e0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
            {/* Clean Modal Header Bar */}
            <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
              <span className="text-dark fw-800" style={{ fontSize: 16 }}>Payslip Preview</span>
              <div className="d-flex gap-2">
                <button onClick={handlePrint}
                  className="d-flex align-items-center gap-2 px-3 fw-600"
                  style={{ height: 36, background: '#003366', color: '#ffffff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                  <Download size={14} /> Download PDF
                </button>
                <button 
                  onClick={() => setActiveSlip(null)}
                  className="d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36, background: '#ffefef', border: '1px solid #ffccd5', borderRadius: 8, color: '#e03131', cursor: 'pointer' }}>
                  <X size={18} style={{ strokeWidth: 2.5 }} />
                </button>
              </div>
            </div>

            {/* Printable Content Section */}
            <div id="payslip-printable" className="p-4" style={{ color: '#000000' }}>

              {/* Company Logo / Header */}
              <div className="d-flex justify-content-between align-items-center mb-4" style={{ borderBottom: '2px solid #000', paddingBottom: 10 }}>
                <div>
                  <h3 style={{ color: '#003366', fontWeight: 800, margin: 0 }}>WebAnatomy HRMS</h3>
                  <p style={{ color: '#555', fontSize: 13, margin: 0 }}>Corporate Employee Salary Statement</p>
                </div>
                <div className="text-end">
                  <h5 style={{ margin: 0, fontWeight: 700 }}>PAYSLIP</h5>
                  <span style={{ fontSize: 12, color: '#666' }}>{MONTH_NAMES[parseInt(activeSlip.month)]} {activeSlip.year}</span>
                </div>
              </div>

              {/* Employee & Pay Period Information */}
              <div style={{ background: '#f4f4f4', padding: '15px 20px', borderRadius: 8, marginBottom: 25, border: '1px solid #ccc' }}>
                <div className="row g-2">
                  <div className="col-6">
                    <span style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>EMPLOYEE NAME:</span>
                    <span style={{ fontSize: 13, color: '#000', fontWeight: 700, marginLeft: 8 }}>{activeSlip.employee_name || user?.name}</span>
                  </div>
                  <div className="col-6 text-end">
                    <span style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>ANNUAL CTC:</span>
                    <span style={{ fontSize: 13, color: '#000', fontWeight: 700, marginLeft: 8 }}>{fmt(activeSlip.ctc)}</span>
                  </div>
                  <div className="col-6">
                    <span style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>DEPARTMENT:</span>
                    <span style={{ fontSize: 12, color: '#000', fontWeight: 700, marginLeft: 8 }}>{activeSlip.department || 'N/A'}</span>
                  </div>
                  <div className="col-6 text-end">
                    <span style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>POSITION:</span>
                    <span style={{ fontSize: 12, color: '#000', fontWeight: 700, marginLeft: 8 }}>{activeSlip.position || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Complete Breakdown Table */}
              {(() => {
                const curCtc = parseFloat(activeSlip.ctc || 0);
                const basicYr = curCtc * 0.50;
                const hraYr = curCtc * 0.20;
                const allowancesYr = curCtc * 0.05;
                const conveyanceYr = 19200;
                const specialYr = curCtc - (basicYr + hraYr + allowancesYr + conveyanceYr);

                const basicMo = basicYr / 12;
                const hraMo = hraYr / 12;
                const allowancesMo = allowancesYr / 12;
                const conveyanceMo = conveyanceYr / 12;
                const specialMo = specialYr / 12;

                const grossPayYr = curCtc;
                const grossPayMo = curCtc / 12;

                const ptYr = 2400;
                const ptMo = 200;

                const lopDeduction = parseFloat(activeSlip.lop_deduction || 0);
                const absentDeduction = parseFloat(activeSlip.absent_deduction || 0);
                const lateDeduction = parseFloat(activeSlip.late_deduction || 0);

                const totalDeductionsMo = ptMo + lopDeduction + absentDeduction + lateDeduction;
                const totalDeductionsYr = ptYr + lopDeduction + absentDeduction + lateDeduction; // do not multiply monthly penalties by 12

                const netPaidMo = grossPayMo - totalDeductionsMo + parseFloat(activeSlip.expense_reimbursement || 0);
                const netPaidYr = grossPayYr - totalDeductionsYr + parseFloat(activeSlip.expense_reimbursement || 0); // do not multiply monthly expenses by 12

                return (
                  <div className="table-responsive" style={{ border: '1px solid #000' }}>
                    <table className="table table-bordered mb-0" style={{ borderColor: '#000', fontSize: 12, color: '#000' }}>
                      <thead style={{ background: '#c6d9f1' }}>
                        <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #000' }}>
                          <th style={{ background: '#c6d9f1', color: '#000', borderRight: '1px solid #000' }}>SALARY DETAILS</th>
                          <th className="text-end" style={{ background: '#c6d9f1', color: '#000', borderRight: '1px solid #000' }}>Amount Per Annum (in Rs.)</th>
                          <th className="text-end" style={{ background: '#c6d9f1', color: '#000' }}>Amount Per Month (in Rs.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td style={{ borderRight: '1px solid #000' }}>Basic</td><td className="text-end font-monospace" style={{ borderRight: '1px solid #000' }}>{fmt(basicYr)}</td><td className="text-end font-monospace">{fmt(basicMo)}</td></tr>
                        <tr><td style={{ borderRight: '1px solid #000' }}>HRA</td><td className="text-end font-monospace" style={{ borderRight: '1px solid #000' }}>{fmt(hraYr)}</td><td className="text-end font-monospace">{fmt(hraMo)}</td></tr>
                        <tr><td style={{ borderRight: '1px solid #000' }}>Other Allowances</td><td className="text-end font-monospace" style={{ borderRight: '1px solid #000' }}>{fmt(allowancesYr)}</td><td className="text-end font-monospace">{fmt(allowancesMo)}</td></tr>
                        <tr><td style={{ borderRight: '1px solid #000' }}>Conveyance</td><td className="text-end font-monospace" style={{ borderRight: '1px solid #000' }}>{fmt(conveyanceYr)}</td><td className="text-end font-monospace font-monospace">{fmt(conveyanceMo)}</td></tr>
                        <tr><td style={{ borderRight: '1px solid #000' }}>Special Allowance</td><td className="text-end font-monospace" style={{ borderRight: '1px solid #000' }}>{fmt(specialYr)}</td><td className="text-end font-monospace font-monospace">{fmt(specialMo)}</td></tr>
                        
                        <tr style={{ background: '#d9d9d9', fontWeight: 'bold' }}>
                          <td style={{ borderRight: '1px solid #000' }}>Total</td>
                          <td className="text-end font-monospace" style={{ borderRight: '1px solid #000' }}>{fmt(grossPayYr)}</td>
                          <td className="text-end font-monospace">{fmt(grossPayMo)}</td>
                        </tr>

                        <tr style={{ background: '#d9d9d9', fontWeight: 'bold' }}>
                          <td style={{ borderRight: '1px solid #000' }}>Gross Pay</td>
                          <td className="text-end font-monospace" style={{ borderRight: '1px solid #000' }}>{fmt(grossPayYr)}</td>
                          <td className="text-end font-monospace">{fmt(grossPayMo)}</td>
                        </tr>

                        <tr style={{ background: '#f4f4f4', fontWeight: 'bold', borderTop: '2px solid #000' }}>
                          <td colSpan={3} className="text-center" style={{ fontSize: 11, letterSpacing: '1px' }}>Deductions</td>
                        </tr>
                        <tr><td style={{ borderRight: '1px solid #000' }}>Professional Tax</td><td className="text-end font-monospace font-monospace" style={{ borderRight: '1px solid #000' }}>{fmt(ptYr)}</td><td className="text-end font-monospace font-monospace">{fmt(ptMo)}</td></tr>
                        
                        {(lopDeduction > 0 || absentDeduction > 0 || lateDeduction > 0) && (
                          <tr style={{ color: '#900' }}>
                            <td style={{ borderRight: '1px solid #000' }}>Penalty (LOP/Absent/Late)</td>
                            <td className="text-end font-monospace" style={{ borderRight: '1px solid #000' }}>{fmt(totalDeductionsYr - ptYr)}</td>
                            <td className="text-end font-monospace">{fmt(totalDeductionsMo - ptMo)}</td>
                          </tr>
                        )}

                        {parseFloat(activeSlip.expense_reimbursement || 0) > 0 && (
                          <tr style={{ color: '#060', fontWeight: 'bold' }}>
                            <td style={{ borderRight: '1px solid #000' }}>Expense Reimbursements</td>
                            <td className="text-end font-monospace" style={{ borderRight: '1px solid #000' }}>{fmt(parseFloat(activeSlip.expense_reimbursement))}</td>
                            <td className="text-end font-monospace">{fmt(parseFloat(activeSlip.expense_reimbursement))}</td>
                          </tr>
                        )}

                        <tr style={{ background: '#b4c6e7', fontWeight: 'bold', fontSize: 13, borderTop: '2px solid #000' }}>
                          <td style={{ borderRight: '1px solid #000' }}>Net Paid</td>
                          <td className="text-end font-monospace" style={{ borderRight: '1px solid #000' }}>{fmt(netPaidYr)}</td>
                          <td className="text-end font-monospace">{fmt(netPaidMo)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
            {/* End printable */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
