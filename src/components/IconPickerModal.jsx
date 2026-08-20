import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import s from './IconPickerModal.module.css'

const EMOJI_CATEGORIES = [
  {
    id: 'all',
    label: '✨ Tất cả',
  },
  {
    id: 'mood',
    label: '💖 Tâm trạng',
    emojis: [
      { char: '🥰', name: 'Hạnh phúc yêu đời' },
      { char: '😍', name: 'Say đắm mê mẩn' },
      { char: '😭', name: 'Khóc buồn tủi thân' },
      { char: '😡', name: 'Tức giận cáu gắt' },
      { char: '🥳', name: 'Tiệc tùng ăn mừng' },
      { char: '😴', name: 'Buồn ngủ mệt mỏi' },
      { char: '🤩', name: 'Hào hứng phấn khích' },
      { char: '🥺', name: 'Nhõng nhẽo dễ thương' },
      { char: '😇', name: 'Ngoan ngoãn thiên thần' },
      { char: '🫶', name: 'Bắn tim yêu thương' },
      { char: '💔', name: 'Tan vỡ đau lòng' },
      { char: '💌', name: 'Thư tình lãng mạn' },
      { char: '✨', name: 'Lấp lánh tỏa sáng' },
      { char: '💫', name: 'Chóng mặt bối rối' },
      { char: '💖', name: 'Trái tim lấp lánh' },
    ],
  },
  {
    id: 'health',
    label: '💊 Sức khỏe',
    emojis: [
      { char: '💊', name: 'Uống thuốc định kỳ' },
      { char: '🩸', name: 'Kỳ kinh nguyệt' },
      { char: '🩹', name: 'Băng gạc vết thương' },
      { char: '🩺', name: 'Khám bác sĩ' },
      { char: '🧘‍♀️', name: 'Tập yoga thư giãn' },
      { char: '🏃‍♀️', name: 'Chạy bộ thể dục' },
      { char: '💧', name: 'Uống đủ nước' },
      { char: '🛌', name: 'Nghỉ ngơi dưỡng sức' },
      { char: '🤒', name: 'Sốt cảm cúm' },
      { char: '🍵', name: 'Trà ấm thảo mộc' },
      { char: '🍏', name: 'Ăn trái cây lành mạnh' },
      { char: '🥑', name: 'Bơ dinh dưỡng' },
      { char: '🍫', name: 'Thèm ngọt sô-cô-la' },
      { char: '🧸', name: 'Ôm gấu êm ái' },
      { char: '🌸', name: 'Ngày rụng trứng' },
    ],
  },
  {
    id: 'lifestyle',
    label: '☕ Thói quen',
    emojis: [
      { char: '☕', name: 'Cà phê sáng' },
      { char: '🧋', name: 'Trà sữa trân châu' },
      { char: '🍦', name: 'Kem ngọt mát' },
      { char: '🥗', name: 'Ăn healthy thanh đạm' },
      { char: '🍕', name: 'Ăn pizza tụ tập' },
      { char: '🍜', name: 'Mì gói / Phở nóng' },
      { char: '📚', name: 'Đọc sách học bài' },
      { char: '🎬', name: 'Xem phim rạp' },
      { char: '🛍️', name: 'Đi mua sắm shopping' },
      { char: '🧹', name: 'Dọn dẹp phòng ốc' },
      { char: '🍳', name: 'Tự nấu ăn tại nhà' },
      { char: '🎧', name: 'Nghe nhạc chill' },
      { char: '🚗', name: 'Đi dạo phố vi vu' },
      { char: '🛒', name: 'Đi siêu thị chợ' },
      { char: '🚿', name: 'Tắm nước nóng' },
    ],
  },
  {
    id: 'work',
    label: '💻 Công việc & Học',
    emojis: [
      { char: '💻', name: 'Làm việc laptop' },
      { char: '📝', name: 'Ghi chép note quan trọng' },
      { char: '⏰', name: 'Báo thức đúng giờ' },
      { char: '🎯', name: 'Mục tiêu hoàn thành' },
      { char: '💡', name: 'Ý tưởng sáng tạo' },
      { char: '📅', name: 'Lịch hẹn sự kiện' },
      { char: '🎨', name: 'Vẽ tranh thiết kế' },
      { char: '✈️', name: 'Đi công tác du lịch' },
      { char: '💰', name: 'Nhận lương tiết kiệm' },
      { char: '🎓', name: 'Thi cử tốt nghiệp' },
      { char: '📌', name: 'Ghim việc khẩn cấp' },
      { char: '🔑', name: 'Chìa khóa thành công' },
      { char: '🏆', name: 'Chiến thắng giải thưởng' },
      { char: '⭐', name: 'Đạt sao xuất sắc' },
      { char: '🔥', name: 'Cháy hết mình deadline' },
    ],
  },
  {
    id: 'cute',
    label: '🌸 Đáng yêu & Pet',
    emojis: [
      { char: '🌸', name: 'Hoa anh đào nở' },
      { char: '🌷', name: 'Hoa tulip hồng' },
      { char: '🌻', name: 'Hoa hướng dương tươi' },
      { char: '🍀', name: 'Cỏ 4 lá may mắn' },
      { char: '🐱', name: 'Mèo cưng dễ thương' },
      { char: '🐶', name: 'Cún cưng ngoan ngoãn' },
      { char: '🐰', name: 'Thỏ con đáng yêu' },
      { char: '🐻', name: 'Gấu bông ấm áp' },
      { char: '🐼', name: 'Gấu trúc hiền lành' },
      { char: '🎀', name: 'Nơ hồng xinh xắn' },
      { char: '🌈', name: 'Cầu vồng sau mưa' },
      { char: '☀️', name: 'Nắng ấm chan hòa' },
      { char: '🌙', name: 'Trăng đêm yên tĩnh' },
      { char: '☁️', name: 'Mây bồng bềnh' },
      { char: '🌿', name: 'Cây lá tươi tốt' },
    ],
  },
]

const ALL_EMOJIS = EMOJI_CATEGORIES.filter(c => c.emojis).flatMap(c => c.emojis)

export default function IconPickerModal({ onSelectIcon, onClose, existingIcons = [] }) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [addedToast, setAddedToast] = useState('')

  const filteredEmojis = useMemo(() => {
    let list = activeTab === 'all'
      ? ALL_EMOJIS
      : (EMOJI_CATEGORIES.find(c => c.id === activeTab)?.emojis || [])

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = ALL_EMOJIS.filter(
        item => item.char.includes(q) || item.name.toLowerCase().includes(q)
      )
    }

    const seen = new Set()
    return list.filter(item => {
      if (seen.has(item.char)) return false
      seen.add(item.char)
      return true
    })
  }, [activeTab, searchQuery])

  const handlePick = (char) => {
    onSelectIcon(char)
    setAddedToast(`Đã thêm ${char} vào khay!`)
    setTimeout(() => setAddedToast(''), 1800)
  }

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    const clean = customInput.trim()
    if (!clean) return
    const char = Array.from(clean)[0]
    if (char) {
      onSelectIcon(char)
      setAddedToast(`Đã thêm ${char} vào khay!`)
      setCustomInput('')
      setTimeout(() => setAddedToast(''), 1800)
    }
  }

  if (typeof document === 'undefined') return null

  const modalContent = (
    <div className={s.modalOverlay} onClick={onClose} role="dialog" aria-label="Chọn Icon Tùy Chỉnh">
      <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={s.header}>
          <div className={s.titleGroup}>
            <span className={s.titleIcon}>🎨</span>
            <h3 className={s.title}>Thêm Icon Vào Khay</h3>
          </div>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* Toast Feedback */}
        {addedToast && (
          <div className={s.toastBar} role="status" aria-live="polite">
            ✨ {addedToast}
          </div>
        )}

        {/* Search Bar */}
        <div className={s.searchBarWrapper}>
          <input
            type="text"
            className={s.searchInput}
            placeholder="🔍 Tìm kiếm icon (ví dụ: thuốc, cà phê, vui...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Custom Input Form */}
        <form className={s.customInputRow} onSubmit={handleCustomSubmit}>
          <input
            type="text"
            className={s.customDirectInput}
            placeholder="Hoặc dán emoji bạn thích vào đây..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
          <button
            type="submit"
            className={s.addDirectBtn}
            disabled={!customInput.trim()}
          >
            + Thêm
          </button>
        </form>

        {/* Category Tabs */}
        {!searchQuery && (
          <div className={s.categoryTabs} role="tablist">
            {EMOJI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeTab === cat.id}
                className={`${s.catTabBtn} ${activeTab === cat.id ? s.activeTab : ''}`}
                onClick={() => setActiveTab(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Emoji Grid */}
        <div className={s.emojiGrid}>
          {filteredEmojis.length === 0 ? (
            <div className={s.emptyState}>
              <span className={s.emptyIcon}>🔍</span>
              <p>Không tìm thấy icon nào phù hợp.</p>
              <p className={s.emptySub}>Hãy thử tìm từ khác hoặc dán trực tiếp emoji ở trên nhé!</p>
            </div>
          ) : (
            filteredEmojis.map(({ char, name }) => {
              const isAlreadyInTray = existingIcons.includes(char)
              return (
                <button
                  key={char}
                  type="button"
                  className={`${s.emojiCell} ${isAlreadyInTray ? s.alreadyAdded : ''}`}
                  onClick={() => handlePick(char)}
                  title={`${name} (Click để thêm vào khay)`}
                >
                  <span className={s.emojiChar}>{char}</span>
                  <span className={s.emojiName}>{name}</span>
                  {isAlreadyInTray && <span className={s.addedBadge}>✓</span>}
                </button>
              )
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className={s.footer}>
          <span className={s.footerHint}>
            💡 <strong>Mẹo:</strong> Sau khi thêm, icon sẽ nằm trong khay để bạn kéo thả vào lịch!
          </span>
          <button type="button" className={s.doneBtn} onClick={onClose}>
            Xong
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
