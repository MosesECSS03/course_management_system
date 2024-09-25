import React from 'react';
import '../../../css/sub/agreementDetails.css';

class AgreementDetailsSection extends React.Component {
  render() {
    return (
      <div className="agreement-details-section">
        <div className="input-group">
          <label>Consent for use of Personal Data</label>
          <span className="agreement-detail-text">
            This section is currently emptyBy submitting this form, I consent to my Personal Data being collected, used and disclosed to C3A andrelevant partners for course administration purpose and to be informed of relevant information onprogrammes, research and publicity relating to active ageing. Do note that photographs and videos may be taken during the course for publicity purposes. 
            I agree to C3A’s privacy policy which may be viewed at <a href="https://www.c3a.org.sg">www.c3a.org.sg</a>. I understand that I may update my  personal data or withdraw my consent at any time by emailing <a href="mailto:dataprotection@c3a.org.sg">dataprotection@c3a.org.sg</a>.
            <br/>
            通过提交本表格，我同意让活跃乐龄理事会(C3A)及有关机构拥有我的个人资料，并且通过简讯，邮件或其他通讯管道：无论电子传递或其他方式）接受关于乐龄人士活跃乐龄的节目，调查，促销和其他讯息，我也同意主办单位和C3A在节目，活动中拍照和录像作为宣传用途。
            我了解我可以随时通过发送电子邮件至<a href="mailto:dataprotection@c3a.org.sg">dataprotection@c3a.org.sg</a>更新我的个人资料或撤销我的同意，活跃乐龄理事会的隐私条款可在 <a href="https://www.c3a.org.sg">www.c3a.org.sg</a>网站上查阅。</span>
        </div>
          <span className="agreement-detail-text">
            <div className="input-group">
            <label>I agree to C3A's privacy policy 我同意活跃乐龄理事会的隐私条款</label>
              <label>
                <input
                  type="radio"
                  value="agree" 
                />
                Agree 我同意
              </label>
            </div>
            </span>
        </div>
    );
  }
}

export default AgreementDetailsSection;