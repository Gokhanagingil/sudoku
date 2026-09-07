import { ArrowLeft, Check, Eye, Gauge, Hash, Music2, Palette, ScanEye, Smartphone, Vibrate } from 'lucide-react';
import { VISUAL_THEMES } from '../domain/themes';
import type { GameSettings, ThemeId } from '../domain/types';
import type { GameAction } from '../state/gameState';
import { ThemePreview } from '../components/ThemePreview';

interface SettingsScreenProps {
  settings: GameSettings;
  dispatch: React.Dispatch<GameAction>;
  onBack: () => void;
}

export function SettingsScreen({ settings, dispatch, onBack }: SettingsScreenProps) {
  const update = (next: Partial<GameSettings>) => dispatch({ type: 'updateSettings', settings: next });
  return (
    <main className="settings-screen page-shell">
      <header className="screen-header">
        <button type="button" className="icon-button" onClick={onBack} aria-label="Geri dön"><ArrowLeft aria-hidden="true" /></button>
        <div><span className="eyebrow">KİŞİSEL DENEYİM</span><h1>Ayarlar</h1></div>
        <span className="header-spacer" />
      </header>

      <section className="settings-group" aria-labelledby="theme-heading">
        <div className="settings-group__title"><Palette aria-hidden="true" /><div><h2 id="theme-heading">Görsel tema</h2><p>Bulmaca değişmez; yalnızca simgeler değişir.</p></div></div>
        <div className="theme-list">
          {VISUAL_THEMES.map((theme) => (
            <ThemePreview
              key={theme.id}
              value={theme.id as ThemeId}
              selected={settings.theme === theme.id}
              onSelect={(value) => update({ theme: value })}
              showNumbers={settings.showNumbers}
            />
          ))}
        </div>
      </section>

      <section className="settings-group" aria-labelledby="comfort-heading">
        <div className="settings-group__title"><Eye aria-hidden="true" /><div><h2 id="comfort-heading">Görme ve rahatlık</h2><p>Tahtayı sana en rahat gelen biçime getir.</p></div></div>
        <SettingToggle
          icon={<Hash aria-hidden="true" />}
          title="Sayı desteği"
          description="Kuş ve şekillerin yanında küçük sayıyı da gösterir."
          checked={settings.showNumbers}
          onChange={(checked) => update({ showNumbers: checked })}
        />
        <SettingToggle
          icon={<ScanEye aria-hidden="true" />}
          title="Yüksek kontrast"
          description="Çizgileri ve seçili alanları daha belirgin gösterir."
          checked={settings.highContrast}
          onChange={(checked) => update({ highContrast: checked })}
        />
        <div className="segmented-setting">
          <div><strong>Yazı boyutu</strong><small>Tüm açıklama ve düğmeleri büyütür.</small></div>
          <div className="segmented-control" role="group" aria-label="Yazı boyutu">
            {(['large', 'larger'] as const).map((scale) => (
              <button key={scale} type="button" className={settings.textScale === scale ? 'is-active' : ''} onClick={() => update({ textScale: scale })}>
                {settings.textScale === scale ? <Check size={16} aria-hidden="true" /> : null}{scale === 'large' ? 'Büyük' : 'Daha büyük'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="settings-group" aria-labelledby="play-heading">
        <div className="settings-group__title"><Gauge aria-hidden="true" /><div><h2 id="play-heading">Oyun biçimi</h2><p>Baskı yaratmayan varsayılanlar seçilidir.</p></div></div>
        <SettingToggle
          icon={<Eye aria-hidden="true" />}
          title="Nazik hata kontrolü"
          description="Tekrarlanan veya uyuşmayan simgeyi puan kaybettirmeden gösterir."
          checked={settings.autoCheck}
          onChange={(checked) => update({ autoCheck: checked })}
        />
        <SettingToggle
          icon={<Gauge aria-hidden="true" />}
          title="Süreyi göster"
          description="Süre yalnızca bilgi içindir; puanı veya ilerlemeyi etkilemez."
          checked={settings.showTimer}
          onChange={(checked) => update({ showTimer: checked })}
        />
        <SettingToggle
          icon={<Music2 aria-hidden="true" />}
          title="Yumuşak sesler"
          description="Yerleştirme ve tamamlama seslerini açar."
          checked={settings.sound}
          onChange={(checked) => update({ sound: checked })}
        />
        <SettingToggle
          icon={<Vibrate aria-hidden="true" />}
          title="Hafif titreşim"
          description="Doğru dokunuşları kısa ve yumuşak bir titreşimle hissettirir."
          checked={settings.haptics}
          onChange={(checked) => update({ haptics: checked })}
        />
        <SettingToggle
          icon={<Smartphone aria-hidden="true" />}
          title="Ekranı açık tut"
          description="Bulmaca oynarken telefon ekranının uykuya geçmesini önler."
          checked={settings.keepAwake}
          onChange={(checked) => update({ keepAwake: checked })}
        />
        <SettingToggle
          icon={<SparkleLess />}
          title="Hareketi azalt"
          description="Kutlama ve vurgu animasyonlarını sakinleştirir."
          checked={settings.reducedMotion}
          onChange={(checked) => update({ reducedMotion: checked })}
        />
      </section>

      <footer className="settings-footer">
        <a href="./privacy.html" target="_blank" rel="noreferrer">Gizlilik politikası</a>
        <span>Kuş Köyü Sudoku · 0.1.0</span>
      </footer>
    </main>
  );
}

function SettingToggle({ icon, title, description, checked, onChange }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="setting-row">
      <span className="setting-row__icon">{icon}</span>
      <span className="setting-row__copy"><strong>{title}</strong><small>{description}</small></span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="switch" aria-hidden="true"><span /></span>
    </label>
  );
}

function SparkleLess() {
  return <span aria-hidden="true" className="text-icon">Aa</span>;
}
