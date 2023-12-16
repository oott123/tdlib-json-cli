require_relative 'boot'

module Application
  extend self

  def root
    @root ||= File.dirname(File.expand_path(__dir__))
  end

  def load_libs
    Dir.glob(File.join(root, 'lib/**/*.rb')).sort.each { |fname| load(fname) }
  end
end

Application.load_libs
