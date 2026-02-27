import { motion } from "motion/react";
import { Shield, Mail, Database, Trash2, Phone, Lock, Globe, AlertTriangle } from "lucide-react";

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-28 bg-gradient-to-b from-[#35363A] to-black">
        <div className="mx-auto max-w-[900px] px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Shield className="h-16 w-16 text-[#81D8D0] mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6">
              Politica de Privacidade
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-normal">
              NeuroConexao Atipica
            </p>
            <p className="text-sm text-white/40 mt-4">
              Ultima atualizacao: 16 de fevereiro de 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Conteudo */}
      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* 1. Introducao */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="h-6 w-6 text-[#81D8D0] flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-white">1. Introducao</h2>
              </div>
              <div className="space-y-4 text-base text-white/80 font-normal leading-relaxed">
                <p>
                  A <strong className="text-white">NeuroConexao Atipica</strong> ("nos", "nosso" ou "plataforma") e uma rede social fechada destinada a interacao, relacionamento, amizade e networking entre pessoas neurodivergentes. Esta Politica de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais.
                </p>
                <p>
                  Ao criar uma conta e utilizar a plataforma, voce concorda com as praticas descritas nesta politica.
                </p>
              </div>
            </div>

            {/* 2. Dados Coletados */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-6 w-6 text-[#81D8D0] flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-white">2. Dados Coletados</h2>
              </div>
              <div className="space-y-4 text-base text-white/80 font-normal leading-relaxed">
                <p className="font-semibold text-white">Coletamos os seguintes dados pessoais:</p>
                
                <div className="grid gap-3">
                  <div className="bg-black/40 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-[#81D8D0] font-semibold mt-0.5">a)</span>
                    <div>
                      <strong className="text-white">Nome</strong> — como o usuario prefere ser chamado dentro da comunidade.
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-[#81D8D0] font-semibold mt-0.5">b)</span>
                    <div>
                      <strong className="text-white">E-mail</strong> — utilizado para autenticacao, login e comunicacao essencial sobre a conta.
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-[#81D8D0] font-semibold mt-0.5">c)</span>
                    <div>
                      <strong className="text-white">Numero de WhatsApp</strong> — utilizado exclusivamente para comunicacao sobre liberacao de acesso ao Beta Fechado. Este dado so e utilizado mediante autorizacao explicita do usuario no momento do cadastro.
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-[#81D8D0] font-semibold mt-0.5">d)</span>
                    <div>
                      <strong className="text-white">Foto de perfil</strong> — upload voluntario pelo usuario para personalizacao do perfil.
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-[#81D8D0] font-semibold mt-0.5">e)</span>
                    <div>
                      <strong className="text-white">Bio/descricao pessoal</strong> — texto voluntario fornecido pelo usuario.
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-[#81D8D0] font-semibold mt-0.5">f)</span>
                    <div>
                      <strong className="text-white">Conteudo de posts e comentarios</strong> — textos e imagens publicados voluntariamente pelo usuario dentro da plataforma.
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-[#81D8D0] font-semibold mt-0.5">g)</span>
                    <div>
                      <strong className="text-white">Senha</strong> — armazenada de forma criptografada (hash) pelo servico de autenticacao. Nos nao temos acesso a senha em texto puro.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Uso do WhatsApp */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Phone className="h-6 w-6 text-green-400 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-white">3. Uso do Numero de WhatsApp</h2>
              </div>
              <div className="space-y-4 text-base text-white/80 font-normal leading-relaxed">
                <p>
                  O numero de WhatsApp e coletado <strong className="text-white">exclusivamente</strong> para:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">1.</span>
                    <span>Comunicar ao usuario sobre a liberacao de seu acesso ao Beta Fechado.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">2.</span>
                    <span>Enviar informacoes essenciais sobre o funcionamento da plataforma.</span>
                  </li>
                </ul>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mt-4">
                  <p className="font-semibold text-green-400 mb-2">Consentimento explicito:</p>
                  <p>
                    O usuario deve marcar explicitamente a opcao "Autorizo contato por WhatsApp" durante o cadastro. Sem esta autorizacao, o numero e armazenado mas nao sera utilizado para contato.
                  </p>
                </div>
                <p>
                  O numero de WhatsApp <strong className="text-white">nao e compartilhado com terceiros</strong>, nao e utilizado para fins de marketing, e nao e visivel para outros membros da plataforma.
                </p>
              </div>
            </div>

            {/* 4. Finalidade do uso */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="h-6 w-6 text-[#81D8D0] flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-white">4. Finalidade do Uso dos Dados</h2>
              </div>
              <div className="space-y-4 text-base text-white/80 font-normal leading-relaxed">
                <p className="font-semibold text-white">Os dados sao utilizados exclusivamente para:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span>Funcionamento da plataforma e manutencao da conta do usuario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span>Autenticacao e seguranca de acesso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span>Comunicacao essencial sobre a conta e o acesso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span>Moderacao de conteudo e seguranca da comunidade</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span>Cumprimento de obrigacoes legais</span>
                  </li>
                </ul>
                <div className="bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#C8102E] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#C8102E]">Importante:</p>
                      <p className="text-white/70">
                        Nao utilizamos dados para fins clinicos, terapeuticos ou diagnosticos. As informacoes dos usuarios nao sao vendidas, alugadas ou compartilhadas com terceiros para fins comerciais.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Armazenamento e Retencao */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-6 w-6 text-[#81D8D0] flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-white">5. Armazenamento e Retencao de Dados</h2>
              </div>
              <div className="space-y-4 text-base text-white/80 font-normal leading-relaxed">
                <p>
                  Seus dados sao armazenados em servidores seguros fornecidos pela <strong className="text-white">Supabase</strong> (infraestrutura baseada na Amazon Web Services), com criptografia em transito (HTTPS/TLS) e em repouso.
                </p>
                <p>
                  <strong className="text-white">Periodo de retencao:</strong> seus dados sao mantidos enquanto sua conta estiver ativa. Apos a exclusao da conta, todos os dados pessoais sao removidos em ate 30 dias, exceto quando houver obrigacao legal de retencao.
                </p>
                <p>
                  <strong className="text-white">Senhas:</strong> sao armazenadas usando algoritmos de hash seguros (bcrypt). Nos nao temos acesso a sua senha em texto legivel.
                </p>
              </div>
            </div>

            {/* 6. Exclusao de Conta e Dados */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Trash2 className="h-6 w-6 text-[#C8102E] flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-white">6. Exclusao de Conta e Dados</h2>
              </div>
              <div className="space-y-4 text-base text-white/80 font-normal leading-relaxed">
                <p>
                  O usuario tem o direito de solicitar a exclusao completa de sua conta e de todos os dados pessoais a qualquer momento.
                </p>
                <p className="font-semibold text-white">Como solicitar a exclusao:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">1.</span>
                    <span><strong className="text-white">Dentro do aplicativo:</strong> Acesse seu perfil e utilize a opcao "Excluir minha conta" disponivel nas configuracoes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">2.</span>
                    <span><strong className="text-white">Por e-mail:</strong> Envie uma solicitacao para os enderecos abaixo.</span>
                  </li>
                </ul>
                <p>
                  Ao excluir a conta, serao removidos: dados do perfil, posts, comentarios, foto de perfil e numero de WhatsApp. O processo e concluido em ate 30 dias uteis.
                </p>
                <div className="bg-[#81D8D0]/10 border border-[#81D8D0]/30 rounded-xl p-6 mt-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-6 w-6 text-[#81D8D0] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-white mb-2">
                        Canais para solicitacao de exclusao:
                      </p>
                      <div className="space-y-1">
                        <a
                          href="mailto:contato@neuroconexaoatipica.com.br"
                          className="text-[#81D8D0] font-semibold hover:underline text-lg block"
                        >
                          contato@neuroconexaoatipica.com.br
                        </a>
                        <a
                          href="mailto:neuroconexaoatipica@gmail.com"
                          className="text-[#81D8D0] font-semibold hover:underline text-lg block"
                        >
                          neuroconexaoatipica@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Seguranca */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="h-6 w-6 text-[#81D8D0] flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-white">7. Seguranca</h2>
              </div>
              <div className="space-y-4 text-base text-white/80 font-normal leading-relaxed">
                <p>Empregamos as seguintes medidas de seguranca:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span>Comunicacao criptografada via HTTPS/TLS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span>Autenticacao segura com tokens JWT</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span>Politicas de seguranca em nivel de linha (Row Level Security - RLS) no banco de dados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span>Senhas armazenadas com hash bcrypt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span>Controle de acesso baseado em papeis (roles)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 8. Direitos do Usuario (LGPD) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-[#81D8D0] flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-white">8. Seus Direitos (LGPD)</h2>
              </div>
              <div className="space-y-4 text-base text-white/80 font-normal leading-relaxed">
                <p>
                  Em conformidade com a Lei Geral de Protecao de Dados (Lei n. 13.709/2018 - LGPD), voce tem os seguintes direitos:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span><strong className="text-white">Confirmacao e acesso:</strong> saber se tratamos seus dados e acessar seus dados pessoais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span><strong className="text-white">Correcao:</strong> corrigir dados incompletos, inexatos ou desatualizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span><strong className="text-white">Exclusao:</strong> solicitar a exclusao de seus dados pessoais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span><strong className="text-white">Revogacao de consentimento:</strong> revogar o consentimento dado anteriormente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#81D8D0]">&bull;</span>
                    <span><strong className="text-white">Portabilidade:</strong> solicitar a portabilidade dos seus dados</span>
                  </li>
                </ul>
                <p>
                  Para exercer qualquer desses direitos, entre em contato pelos e-mails listados na secao 6.
                </p>
              </div>
            </div>

            {/* 9. Menores de Idade */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-[#FF6B35] flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-white">9. Restricao de Idade</h2>
              </div>
              <div className="space-y-4 text-base text-white/80 font-normal leading-relaxed">
                <p>
                  A NeuroConexao Atipica e destinada exclusivamente a usuarios com <strong className="text-white">18 anos ou mais</strong>. Nao coletamos intencionalmente dados de menores de idade. O cadastro exige confirmacao de maioridade.
                </p>
                <p>
                  Caso identifiquemos que um usuario menor de idade criou uma conta, esta sera suspensa e os dados serao excluidos.
                </p>
              </div>
            </div>

            {/* 10. Alteracoes */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="space-y-4 text-base text-white/80 font-normal leading-relaxed">
                <h2 className="text-2xl font-semibold text-white mb-4">10. Alteracoes nesta Politica</h2>
                <p>
                  Esta politica pode ser atualizada periodicamente. Alteracoes significativas serao comunicadas por meio da plataforma ou e-mail. A data da ultima atualizacao estara sempre indicada no topo deste documento.
                </p>
              </div>
            </div>

            {/* Contato Final */}
            <div className="bg-[#81D8D0]/10 border border-[#81D8D0]/30 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Duvidas ou solicitacoes?</h3>
              <p className="text-base text-white/70 mb-4">
                Entre em contato conosco:
              </p>
              <div className="space-y-2">
                <a
                  href="mailto:contato@neuroconexaoatipica.com.br"
                  className="text-[#81D8D0] font-semibold hover:underline text-lg block"
                >
                  contato@neuroconexaoatipica.com.br
                </a>
                <a
                  href="mailto:neuroconexaoatipica@gmail.com"
                  className="text-[#81D8D0] font-semibold hover:underline text-lg block"
                >
                  neuroconexaoatipica@gmail.com
                </a>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-white/10">
              <p className="text-white/60 text-base">
                &copy; 2026 NeuroConexao Atipica. Todos os direitos reservados.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
