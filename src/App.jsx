import { useState, useEffect, useRef } from "react";
import { api } from "./api.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function NestaBot() {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [options, setOptions] = useState([]);
  const [inputMode, setInputMode] = useState(false);
  const [inputPlaceholder, setInputPlaceholder] = useState("Type a message...");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState({
    step: "entry",
    user: null,
    visitor: {},
    payment: {},
    tempEstate: null,
  });
  const bottomRef = useRef(null);
  const sessionRef = useRef(session);

  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  useEffect(() => { startConversation(); }, []);

  const addMessage = (text, from = "bot") =>
    new Promise((resolve) => {
      setMessages((prev) => [...prev, { text, from, id: Date.now() + Math.random() }]);
      resolve();
    });

  const botTyping = async (ms = 1200) => {
    setTyping(true);
    await sleep(ms);
    setTyping(false);
  };

  const showOptions = (opts) => setOptions(opts);
  const clearOptions = () => setOptions([]);

  const startConversation = async () => {
    await sleep(600);
    await botTyping(800);
    await addMessage("👋 Welcome to *NESTA* – Your Estate Assistant");
    await botTyping(700);
    await addMessage("Please select your role to continue:");
    showOptions([
      { label: "🏠 Resident", value: "1" },
      { label: "🛡️ Estate Admin", value: "2" },
      { label: "🔐 Security", value: "3" },
      { label: "🔧 Artisan", value: "4" },
    ]);
    setSession((s) => ({ ...s, step: "role_select" }));
  };

  const showMainMenu = async (user) => {
    const u = user || sessionRef.current.user;
    setSession((s) => ({ ...s, step: "main_menu", user: u }));
    await botTyping(800);
    await addMessage(`🏡 *Main Menu*\n\nWelcome, *${u.firstName}*! What would you like to do?`);
    showOptions([
      { label: "👤 Register Visitor", value: "1" },
      { label: "💳 Pay Estate Dues", value: "2" },
      { label: "🔧 Report an Issue", value: "3" },
      { label: "🛠️ Find an Artisan", value: "4" },
      { label: "📋 My Activity", value: "5" },
      { label: "📢 Announcements", value: "6" },
    ]);
  };

  const showDuesMenu = async () => {
    setSession((s) => ({ ...s, step: "payment_options" }));
    await botTyping(900);
    await addMessage("💳 *Estate Dues*\n\nOutstanding Balance: *₦45,000*\n\nSelect an option:");
    showOptions([
      { label: "✅ Pay Full Amount (₦45,000)", value: "full" },
      { label: "✏️ Pay Custom Amount", value: "custom" },
      { label: "📋 View Payment History", value: "history" },
    ]);
  };

  const handleOption = async (opt) => {
    const s = sessionRef.current;
    clearOptions();
    await addMessage(opt.label, "user");

    if (s.step === "role_select") {
      if (opt.value !== "1") {
        await botTyping();
        await addMessage("⚠️ This demo only supports the *Resident* flow. Please select Resident.");
        showOptions([{ label: "🏠 Resident", value: "1" }]);
        return;
      }
      setSession((p) => ({ ...p, step: "check_registered" }));
      await botTyping();
      await addMessage("Are you a new or returning resident?");
      showOptions([
        { label: "🆕 New – Register me", value: "new" },
        { label: "👋 Returning – Log me in", value: "returning" },
      ]);
      return;
    }

    if (s.step === "check_registered") {
      if (opt.value === "new") {
        setSession((p) => ({ ...p, step: "reg_estate" }));
        await botTyping();
        await addMessage("Let's set up your profile! 🎉");
        await botTyping(600);
        await addMessage("🏠 Enter your *Estate Code*:\n_(e.g. OMO-0000 — get this from your estate admin)_");
        setInputMode(true);
        setInputPlaceholder("Estate code e.g. OMO-0000");
      } else {
        setSession((p) => ({ ...p, step: "login_id" }));
        await botTyping();
        await addMessage("👤 Enter your *Unique ID* (e.g. AUT-12345):");
        setInputMode(true);
        setInputPlaceholder("Your Unique ID...");
      }
      return;
    }

    if (s.step === "main_menu") {
      if (opt.value === "1") {
        setSession((p) => ({ ...p, step: "visitor_name", visitor: {} }));
        await botTyping();
        await addMessage("👤 *Visitor Registration*\n\nEnter *Visitor Name*:");
        setInputMode(true);
        setInputPlaceholder("Visitor name...");
      } else if (opt.value === "2") {
        await showDuesMenu();
      } else if (opt.value === "3" || opt.value === "4") {
        await botTyping();
        await addMessage("🚧 This feature is coming soon!");
        await sleep(400);
        await showMainMenu(s.user);
      } else if (opt.value === "5") {
        await botTyping();
        await addMessage("📋 *My Activity*\n\n• Visitor registered: John Doe\n• Payment: ₦45,000 on Jan 15, 2026\n• Issue reported: Broken gate light");
        await sleep(400);
        await showMainMenu(s.user);
      } else if (opt.value === "6") {
        await botTyping();
        await addMessage("📢 *Estate Announcements*\n\n🔴 AGM scheduled for March 5, 2026\n🟡 Water supply disruption on Feb 22\n🟢 New security team deployed");
        await sleep(400);
        await showMainMenu(s.user);
      }
      return;
    }

    if (s.step === "visitor_action") {
      if (opt.value === "share") {
        await botTyping(600);
        await addMessage("📤 Pass details ready to share with your visitor!");
      } else if (opt.value === "another") {
        setSession((p) => ({ ...p, step: "visitor_name", visitor: {} }));
        await botTyping(600);
        await addMessage("👤 Enter *Visitor Name*:");
        setInputMode(true);
        setInputPlaceholder("Visitor name...");
        return;
      }
      await showMainMenu(s.user);
      return;
    }

    if (s.step === "payment_options") {
      if (opt.value === "full") {
        await botTyping();
        await addMessage("⚙️ Generating your secure payment link...");
        await botTyping(1500);
        await addMessage("Choose how you'd like to pay:");
        showOptions([
          { label: "💳 Pay Online (Paystack)", value: "paystack" },
          { label: "🏦 Bank Transfer", value: "bank" },
        ]);
        setSession((p) => ({ ...p, step: "payment_method", payment: { amount: 45000 } }));
        return;
      } else if (opt.value === "custom") {
        setSession((p) => ({ ...p, step: "payment_custom_amount" }));
        await botTyping(700);
        await addMessage("💰 Enter the amount you'd like to pay (₦):");
        setInputMode(true);
        setInputPlaceholder("e.g. 10000");
        return;
      } else if (opt.value === "history") {
        await botTyping();
        await addMessage("📋 *Payment History*\n\n• ₦45,000 – Jan 2026 ✅\n• ₦45,000 – Oct 2025 ✅\n• ₦45,000 – Jul 2025 ✅");
        showOptions([
          { label: "⬅️ Back to Dues", value: "back_dues" },
          { label: "🏠 Main Menu", value: "menu" },
        ]);
        setSession((p) => ({ ...p, step: "post_history" }));
        return;
      }
    }

    if (s.step === "post_history") {
      opt.value === "back_dues" ? await showDuesMenu() : await showMainMenu(s.user);
      return;
    }

    if (s.step === "payment_method") {
      const amount = s.payment.amount;
      if (opt.value === "paystack") {
        await botTyping(1000);
        await addMessage(`🔗 *Secure Payment Link*\n\n💰 Amount: ₦${amount.toLocaleString()}\n\n[Pay Now → https://paystack.com/pay/nesta-demo]\n\n_Link expires in 30 minutes_`);
        await botTyping(3000);
        const receiptId = `NST-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        await addMessage(`✅ *Payment Successful!*\n\n₦${amount.toLocaleString()} received.\nReceipt ID: ${receiptId}\n\nThank you! 🎉`);
      } else {
        const estate = s.user.estate;
        await botTyping(900);
        await addMessage(`🏦 *Transfer Details*\n\nAccount Number: ${estate.account_number}\nAccount Name: ${estate.account_name}\nBank: ${estate.bank}\nAmount: ₦${amount.toLocaleString()}`);
        showOptions([
          { label: "📋 I've Made the Transfer", value: "confirm_transfer" },
          { label: "🏠 Main Menu", value: "menu" },
        ]);
        setSession((p) => ({ ...p, step: "awaiting_transfer" }));
        return;
      }
      await showMainMenu(s.user);
      return;
    }

    if (s.step === "awaiting_transfer") {
      if (opt.value === "confirm_transfer") {
        await botTyping(1000);
        await addMessage("⏳ *Pending Confirmation*\n\nYour transfer has been logged. You'll be notified once confirmed by estate admin.");
      }
      await showMainMenu(s.user);
      return;
    }
  };

  const handleInput = async () => {
    const val = inputVal.trim();
    if (!val || loading) return;
    const s = sessionRef.current;
    setInputVal("");
    setInputMode(false);
    clearOptions();
    await addMessage(val, "user");

    if (s.step === "login_id") {
      setLoading(true);
      await botTyping(1000);
      await addMessage("🔍 Looking up your account...");
      const result = await api.login(val);
      setLoading(false);
      if (result.error) {
        await botTyping(700);
        await addMessage(`⚠️ ${result.error}`);
        setInputMode(true);
        setInputPlaceholder("Your Unique ID...");
        return;
      }
      const r = result.resident;
      const user = { id: r.id, name: r.full_name, firstName: r.first_name, uniqueId: r.unique_id, estate: r.estates };
      setSession((p) => ({ ...p, user }));
      await botTyping(600);
      await addMessage(`✅ Welcome back, *${user.firstName}*!`);
      await showMainMenu(user);
      return;
    }

    if (s.step === "reg_estate") {
      setLoading(true);
      await botTyping(900);
      await addMessage("🔍 Validating estate code...");
      const result = await api.lookupEstate(val.toUpperCase());
      setLoading(false);
      if (result.error) {
        await botTyping(700);
        await addMessage(`⚠️ Estate code "*${val.toUpperCase()}*" not recognised.\n\nPlease check the code with your estate admin and try again.`);
        setInputMode(true);
        setInputPlaceholder("Estate code e.g. OMO-0000");
        return;
      }
      const estate = result.estate;
      setSession((p) => ({ ...p, step: "reg_name", tempEstate: estate }));
      await botTyping(500);
      await addMessage(`✅ *Estate Verified!*\n\n🏠 ${estate.name}`);
      await botTyping(600);
      await addMessage("👤 Enter your *Full Name*:");
      setInputMode(true);
      setInputPlaceholder("e.g. Ola Demo");
      return;
    }

    if (s.step === "reg_name") {
      setLoading(true);
      await botTyping(1400);
      await addMessage("⚙️ Setting up your account...");
      const result = await api.register(val, s.tempEstate.id);
      setLoading(false);
      if (result.error) {
        await botTyping(700);
        await addMessage(`⚠️ ${result.error}`);
        setSession((p) => ({ ...p, step: "reg_estate" }));
        setInputMode(true);
        setInputPlaceholder("Estate name or code...");
        return;
      }
      const r = result.resident;
      const user = { id: r.id, name: r.full_name, firstName: r.first_name, uniqueId: r.unique_id, estate: s.tempEstate };
      setSession((p) => ({ ...p, user }));
      await botTyping(800);
      await addMessage(`🎉 *Registration Successful!*\n\n🏠 Estate: ${s.tempEstate.name}\n📍 Code: ${s.tempEstate.code}\n👤 Name: ${r.full_name}\n🆔 Unique ID: *${r.unique_id}*\n\n_Save your Unique ID — you'll need it to log in._`);
      await showMainMenu(user);
      return;
    }

    if (s.step === "visitor_name") {
      setSession((p) => ({ ...p, step: "visitor_date", visitor: { name: val } }));
      await botTyping(700);
      await addMessage("📅 *Expected Date of Visit?* (DD/MM/YYYY)");
      setInputMode(true);
      setInputPlaceholder("e.g. 20/02/2026");
      return;
    }

    if (s.step === "visitor_date") {
      setSession((p) => ({ ...p, step: "visitor_time", visitor: { ...p.visitor, date: val } }));
      await botTyping(600);
      await addMessage("🕐 *Expected Time?* (Optional – type 'skip' to continue)");
      setInputMode(true);
      setInputPlaceholder("e.g. 2:00 PM or 'skip'");
      return;
    }

    if (s.step === "visitor_time") {
      const time = val.toLowerCase() === "skip" ? null : val;
      const { name, date } = s.visitor;
      setLoading(true);
      await botTyping(1200);
      await addMessage("📝 Registering visitor...");
      const result = await api.registerVisitor(s.user.id, name, date, time, s.user.estate?.code);
      setLoading(false);
      if (result.error) {
        await botTyping(700);
        await addMessage(`⚠️ Could not register visitor: ${result.error}`);
        await showMainMenu(s.user);
        return;
      }
      const passId = result.visitor.pass_id;
      setSession((p) => ({ ...p, step: "visitor_action", visitor: { name, date, time, passId } }));
      await addMessage(`✅ *Visitor Registered!*\n\n👤 Visitor: ${name}\n📅 Date: ${date}${time ? `\n🕐 Time: ${time}` : ""}\n🎫 Pass ID: *${passId}*\n\n_Show this Pass ID to Security on arrival._`);
      await botTyping(400);
      showOptions([
        { label: "📤 Share Details", value: "share" },
        { label: "➕ Register Another", value: "another" },
        { label: "🏠 Back to Menu", value: "menu" },
      ]);
      return;
    }

    if (s.step === "payment_custom_amount") {
      const amount = parseInt(val.replace(/,/g, ""), 10);
      if (isNaN(amount) || amount < 100) {
        await botTyping(600);
        await addMessage("⚠️ Please enter a valid amount (minimum ₦100).");
        setInputMode(true);
        setInputPlaceholder("e.g. 10000");
        return;
      }
      setSession((p) => ({ ...p, step: "payment_method", payment: { amount } }));
      await botTyping(900);
      await addMessage(`💰 Amount: ₦${amount.toLocaleString()}\n\nChoose payment method:`);
      showOptions([
        { label: "💳 Pay Online (Paystack)", value: "paystack" },
        { label: "🏦 Bank Transfer", value: "bank" },
      ]);
      return;
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleInput(); };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0a0f1e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2a3a5c; border-radius: 4px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,80%,100% { opacity: 0; } 40% { opacity: 1; } }
        @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        .msg { animation: fadeUp 0.3s ease forwards; }
        .opt-btn { transition: all 0.18s ease; cursor: pointer; }
        .opt-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,200,150,0.25) !important; }
        .opt-btn:active { transform: scale(0.97); }
        .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #00c896; animation: blink 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        .loading-bar { height: 2px; background: linear-gradient(90deg, transparent, #00c896, transparent); animation: slide 1.5s infinite; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column" }}>
        <div style={{ background: "linear-gradient(135deg, #00c896 0%, #00a878 100%)", borderRadius: "20px 20px 0 0", padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏡</div>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: "#fff", fontSize: 16, letterSpacing: 1 }}>NESTA</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }}></span>
              Estate Assistant · Online
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.6)", textAlign: "right" }}>
            Powered by<br /><span style={{ color: "#fff", fontWeight: 700 }}>NESTA</span>
          </div>
        </div>

        {loading && <div style={{ overflow: "hidden", height: 2, background: "#1e2d45" }}><div className="loading-bar" /></div>}

        <div style={{ background: "#111827", minHeight: 520, maxHeight: 520, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((msg) => (
            <div key={msg.id} className="msg" style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start" }}>
              {msg.from === "bot" && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#00c896", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>🏡</div>
              )}
              <div style={{
                maxWidth: "78%", padding: "10px 14px",
                borderRadius: msg.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.from === "user" ? "linear-gradient(135deg, #00c896, #00a878)" : "#1e2d45",
                color: msg.from === "user" ? "#fff" : "#d1e8ff",
                fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap",
                boxShadow: msg.from === "user" ? "0 2px 12px rgba(0,200,150,0.3)" : "0 2px 8px rgba(0,0,0,0.3)",
              }}
                dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*(.*?)\*/g, "<strong>$1</strong>").replace(/_(.*?)_/g, "<em>$1</em>") }}
              />
            </div>
          ))}
          {typing && (
            <div className="msg" style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#00c896", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🏡</div>
              <div style={{ background: "#1e2d45", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", display: "flex", gap: 5 }}>
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {options.length > 0 && (
          <div style={{ background: "#0d1626", padding: "10px 12px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {options.map((opt, i) => (
              <button key={i} className="opt-btn" onClick={() => handleOption(opt)} style={{
                background: "transparent", border: "1.5px solid #00c896", color: "#00c896",
                borderRadius: 20, padding: "7px 14px", fontSize: 12.5,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500, letterSpacing: 0.3,
              }}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {inputMode && (
          <div style={{ background: "#0d1626", padding: "10px 12px", display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKey}
              placeholder={inputPlaceholder}
              autoFocus
              disabled={loading}
              style={{
                flex: 1, background: "#1e2d45", border: "1.5px solid #2a3a5c",
                borderRadius: 24, padding: "10px 16px", color: "#d1e8ff",
                fontSize: 13.5, outline: "none", fontFamily: "'DM Sans', sans-serif",
                opacity: loading ? 0.5 : 1,
              }}
              onFocus={(e) => (e.target.style.borderColor = "#00c896")}
              onBlur={(e) => (e.target.style.borderColor = "#2a3a5c")}
            />
            <button onClick={handleInput} disabled={loading} style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg, #00c896, #00a878)",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, opacity: loading ? 0.6 : 1,
            }}>➤</button>
          </div>
        )}

        <div style={{ background: "#0a0f1e", borderRadius: "0 0 20px 20px", padding: "10px", textAlign: "center" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#2a3a5c", letterSpacing: 1 }}>NESTA ESTATE INTELLIGENCE · SECURE · ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
}
